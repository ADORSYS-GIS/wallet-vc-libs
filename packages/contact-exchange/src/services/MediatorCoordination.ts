import {
  SecretsResolver,
  Secret,
  IMessage,
  Message
} from 'didcomm-node';
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

    const didTo = decodedOob.from;
    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();
    console.log('Generated DID:', JSON.stringify(didPeer, null, 2));

    const resolver = new PeerDIDResolver();

    const secrets = [didPeer.privateKeyE, didPeer.privateKeyV];
    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);
    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);

    const mediatorDIDDoc = await resolver.resolve(decodedOob.from);
    const mediatorService = mediatorDIDDoc?.service?.find(
      (s) => s.type === 'DIDCommMessaging',
    );
    if (!mediatorService) {
      throw new Error('Invalid mediator service endpoint format');
    }

    const mediatorEndpoint = mediatorService.serviceEndpoint;
    console.log('Mediator Endpoint:', JSON.stringify(mediatorEndpoint, null, 2));

    const val: IMessage = {
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: { messagespecificattribute: 'and its value' },
      from: didPeer.did,
      to: [didTo],
      created_time: Math.round(new Date().getTime() / 1000),
      expires_time: Math.round(new Date().getTime() / 1000) + 60,
      return_route: 'all',
    };
    const mediationRequest = new Message(val);

    const [packedMediationRequest] = await mediationRequest.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    console.log('Packed Mediation Request:', packedMediationRequest);

    // Send the packed mediation request to the mediator's endpoint
    const response = await axios.post('http://localhost:3000/', packedMediationRequest, {
      headers: {
        'Content-Type': 'application/didcomm-encrypted+json',
      },
    });

    console.log('Mediator Response:', JSON.stringify(response.data, null, 2));

    // Simulate receiving the packed response and unpacking it
    const receivingSecrets = [didPeer.privateKeyE, didPeer.privateKeyV];
    const receivingSecretsResolver = new DidcommSecretsResolver(
      prependDidToSecretIds(receivingSecrets, didTo),
    );
    console.log(
      'Receiving Secrets Resolver:',
      JSON.stringify(receivingSecretsResolver, null, 2),
    )
    
    const [unpackedMessage, unpackMetadata] = await Message.unpack(
      response.data,
      resolver,
      receivingSecretsResolver,
      {},
    );

    console.log('Unpacked Message:', JSON.stringify(unpackedMessage.as_value(), null, 2));
    console.log('Unpack Metadata:', JSON.stringify(unpackMetadata, null, 2));

    // Validate unpacked content
    const unpackedContent = unpackedMessage.as_value();
    if (unpackedContent.type !== MessageType.MediationResponse) {
      throw new Error('Unexpected message type received');
    }

    console.log('Successfully processed mediation response.');

    // Additional processing can go here...
    
  } catch (error) {
    console.error('Error processing mediator OOB:', error);
  }
}
