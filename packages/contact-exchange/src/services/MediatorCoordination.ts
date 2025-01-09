import { Message, SecretsResolver, Secret, IMessage } from 'didcomm';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { PeerDIDResolver } from 'did-resolver-lib';
import axios from 'axios';

class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    console.log(`get_secret called with secretId: ${secretId}`);
    const secret =
      this.knownSecrets.find((secret) => secret.id === secretId) || null;
    console.log(`Found secret: ${JSON.stringify(secret, null, 2)}`);
    return secret;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    console.log(
      `find_secrets called with secretIds: ${JSON.stringify(secretIds, null, 2)}`,
    );
    const foundSecrets = secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
    console.log(`Found secrets: ${JSON.stringify(foundSecrets, null, 2)}`);
    return foundSecrets;
  }
}

export interface PrivateKeyJWK {
  id: string;
  type: string;
  privateKeyJwk: {
    crv: string;
    d: string;
    kty: string;
    x: string;
    y?: string;
  };
}

function prependDidToSecretIds(
  secrets: PrivateKeyJWK[],
  did: string,
): PrivateKeyJWK[] {
  return secrets.map((secret) => ({
    ...secret,
    id: `${did}${secret.id.split(did).pop()}`,
  }));
}

export async function processMediatorOOB(oob: string) {
  try {
    console.log('Processing OOB:', oob);

    const oobParts = oob.split('=');
    if (oobParts.length < 2) {
      throw new Error('Invalid OOB format. Missing encoded payload.');
    }

    const oobUrl = oobParts[1];
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );

    console.log('Decoded OOB:', JSON.stringify(decodedOob, null, 2));

    if (!decodedOob.from) {
      throw new Error('Invalid OOB content. Missing "from" field.');
    }

    // Recipeint did
    const didTo = decodedOob.from;
    console.log('Decoded DID:', didTo);

    // Generate the sender did
    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();
    console.log(
      'Generated DID:',
      JSON.stringify(didPeer, null, 2),
      didPeer.did,
    );

    const resolver = new PeerDIDResolver();

    const secrets: PrivateKeyJWK[] = [didPeer.privateKeyE, didPeer.privateKeyV];
    console.log('Secrets:', JSON.stringify(secrets, null, 2));

    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);
    console.log('Updated Secrets:', JSON.stringify(updatedSecrets, null, 2));

    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);
    console.log('Secrets Resolver:', JSON.stringify(secretsResolver, null, 2));

    const resolvefrom = await resolver.resolve(didPeer.did);
    console.log('Resolve from:', JSON.stringify(resolvefrom, null, 2));

    // Log the secret IDs that will be requested
    const secretIdsToFind = updatedSecrets.map((secret) => secret.id);
    console.log(
      'Secret IDs to find:',
      JSON.stringify(secretIdsToFind, null, 2),
    );

    // Check if the secrets resolver can find the required secrets
    const foundSecrets = await secretsResolver.find_secrets(secretIdsToFind);
    console.log('Found Secrets:', JSON.stringify(foundSecrets, null, 2));

    const mediatorDIDDoc = await resolver.resolve(decodedOob.from);
    console.log('Mediator DID Doc:', JSON.stringify(mediatorDIDDoc, null, 2));

    const mediatorService = mediatorDIDDoc?.service?.find(
      (s) => s.type === 'DIDCommMessaging',
    );

    if (!mediatorService) {
      throw new Error('Invalid mediator service endpoint format');
    }

    const mediatorEndpoint = mediatorService.serviceEndpoint;
    console.log('Mediator Endpoint:', mediatorEndpoint);

    const val: IMessage = {
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: {},
      from: didPeer.did,
      to: [didTo],
      return_route: 'all',
    };
    const mediationRequest = new Message(val);

    console.log('Mediation Request:', JSON.stringify(val, null, 2));

    const [packedMediationRequest, encryptMetadata] =
      await mediationRequest.pack_encrypted(
        didTo,
        didPeer.did,
        null,
        resolver,
        secretsResolver,
        { forward: false },
      );

    console.log('Packed Mediation Request:', packedMediationRequest);
    console.log('Encrypt Metadata:', encryptMetadata);

    // Use Axios to send the packed request
    const response = await axios.post(
      'http://localhost:3000/',
      packedMediationRequest,
      {
        headers: {
          'Content-Type': 'application/didcomm-encrypted+json',
        },
      },
    );

    // Log the response status and data
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    // Unpack Mediator Response
    const [mediatorResponse, uunpackMetadata_] = await Message.unpack(
      response.data,
      resolver,
      secretsResolver,
      {},
    );

    const reply = mediatorResponse.as_value();
    if (reply.type !== MessageType.MediationResponse) {
      console.error('Invalid mediator response type:', reply.type);
      throw new Error('Invalid mediator response type');
    }

    console.log('Mediator Response:', mediatorResponse);
    console.log('Unpack Metadata:', uunpackMetadata_);
    return mediatorResponse;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error occurred while processing OOB:',
        error.message,
      );
      throw new Error(`Failed to process OOB invitation: ${error.message}`);
    } else if (error instanceof Error) {
      console.error('Error processing OOB:', error);
      throw new Error(`Failed to process OOB invitation: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
      throw error;
    }
  }
}
