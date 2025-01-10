import { SecretsResolver, Secret, IMessage, Message } from 'didcomm-node';
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
    const secret = this.knownSecrets.find((secret) => secret.id === secretId) || null;
    if (!secret) {
      throw new Error(`Secret with ID '${secretId}' not found.`);
    }
    return secret;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    const foundSecrets = secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
    if (foundSecrets.length === 0) {
      throw new Error(`No matching secrets found for the provided IDs: ${secretIds}`);
    }
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
    console.log('Decoded OOB:', decodedOob);

    if (!decodedOob.from) {
      throw new Error('Invalid OOB content. Missing "from" field.');
    }

    const didTo = decodedOob.from;
    console.log('Mediator DID:', didTo);

    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();
    console.log('Generated peer DID:', didPeer);

    const resolver = new PeerDIDResolver();
    const secrets = [didPeer.privateKeyE, didPeer.privateKeyV];
    console.log('Generated secrets:', secrets);

    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);
    console.log('Updated secrets:', updatedSecrets);

    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);
    const mediatorDIDDoc = await resolver.resolve(decodedOob.from);
    console.log('Mediator DID document:', mediatorDIDDoc);

    const mediatorService = mediatorDIDDoc?.service?.find(
      (s) => s.type === 'DIDCommMessaging',
    );
    console.log('Mediator service:', mediatorService);

    if (!mediatorService || !mediatorService.serviceEndpoint) {
      throw new Error('Invalid mediator service endpoint format');
    }

    const mediatorEndpoint = mediatorService.serviceEndpoint;
    console.log('Mediator endpoint:', mediatorEndpoint);

    const val: IMessage = {
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: { messagespecificattribute: 'and its value' },
      from: didPeer.did,
      to: [didTo],
      created_time: Math.round(new Date().getTime() / 1000),
      return_route: 'all',
    };

    console.log('Creating mediation request message:', val);
    const mediationRequest = new Message(val);

    const [packedMediationRequest] = await mediationRequest.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );
    console.log('Packed mediation request:', packedMediationRequest);

    const response = await axios.post(
      'http://localhost:3000/',
      packedMediationRequest,
      {
        headers: {
          'Content-Type': 'application/didcomm-encrypted+json',
        },
      },
    );
    console.log('Mediation request response:', response.data);

    const [unpackedMessage] = await Message.unpack(
      JSON.stringify(response.data),
      resolver,
      secretsResolver,
      {},
    );
    console.log('Unpacked message:', unpackedMessage);

    const unpackedContent = unpackedMessage.as_value();
    console.log('Unpacked content:', unpackedContent);

    if (unpackedContent.type !== MessageType.MediationResponse) {
      throw new Error(
        'Unexpected message type received for Mediation Response',
      );
    }

    const mediatorRoutingKey = unpackedContent.body.body.routing_did;
    const mediatorNewDID = unpackedContent.from;
    if (!mediatorRoutingKey || !mediatorNewDID) {
      throw new Error('Invalid mediation response format');
    }
    console.log('Mediator routing key:', mediatorRoutingKey);
    console.log('Mediator new DID:', mediatorNewDID);

    const newDid =
      await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKey);
    console.log('Generated DID with routing key:', newDid);

    const resolveNewDid = await resolver.resolve(newDid.did);
    console.log('Resolved new DID:', resolveNewDid);

    const keyupdate: IMessage = {
      typ: '',
      id: uuidv4(),
      type: MessageType.KeylistUpdate,
      body: {
        updates: [
          {
            recipient_did: newDid.did,
            action: 'add',
          },
        ],
      },
    };
    console.log('Creating Keylist update message:', keyupdate);

    const keylistUpdate = new Message(keyupdate);
    const packedKeylistUpdate = await keylistUpdate.pack_encrypted(
      mediatorNewDID,
      newDid.did,
      newDid.did,
      resolver,
      secretsResolver,
      { forward: false },
    );
    console.log('Packed Keylist update:', packedKeylistUpdate);

    const keylistResponse = await axios.post(
      'http://localhost:3000/',
      packedKeylistUpdate,
      {
        headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
      },
    );
    console.log('Keylist update response:', keylistResponse.data);

    const [unpackedKeylistResponse] = await Message.unpack(
      JSON.stringify(keylistResponse.data),
      resolver,
      secretsResolver,
      {},
    );
    console.log('Unpacked Keylist response:', unpackedKeylistResponse);

    const responseContent = unpackedKeylistResponse.as_value();
    console.log('Response content:', responseContent);

    if (responseContent.type !== MessageType.KeylistUpdateResponse) {
      throw new Error('Unexpected message type received for Keylist Update');
    }

    if (
      responseContent.body.updated[0]?.recipient_did !== newDid.did ||
      responseContent.body.updated[0]?.action !== 'add' ||
      responseContent.body.updated[0]?.result !== 'success'
    ) {
      throw new Error('Unexpected response in Keylist Update');
    }

    return responseContent.body;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unexpected error:', String(error));
    }
    throw error;
  }
}
