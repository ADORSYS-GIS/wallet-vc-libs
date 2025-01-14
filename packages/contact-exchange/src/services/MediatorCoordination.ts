import { SecretsResolver, Secret, IMessage, Message } from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { PeerDIDResolver } from 'did-resolver-lib';
import axios from 'axios';

// Class to resolve secrets based on known secrets
class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  // Retrieve a secret by its ID
  async get_secret(secretId: string): Promise<Secret | null> {
    const secret =
      this.knownSecrets.find((secret) => secret.id === secretId) || null;
    if (!secret) {
      throw new Error(`Secret with ID '${secretId}' not found.`);
    }
    return secret;
  }

  // Find multiple secrets based on an array of secret IDs
  async find_secrets(secretIds: string[]): Promise<string[]> {
    const foundSecrets = secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
    if (foundSecrets.length === 0) {
      throw new Error(
        `No matching secrets found for the provided IDs: ${secretIds}`,
      );
    }
    return foundSecrets;
  }
}

// Interface for Private Key in JWK format
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

// Function to prepend DID to secret IDs
function prependDidToSecretIds(
  secrets: PrivateKeyJWK[],
  did: string,
): PrivateKeyJWK[] {
  return secrets.map((secret) => ({
    ...secret,
    id: `${did}${secret.id.split(did).pop()}`,
  }));
}

// Main function to process Mediator OOB (Out-of-Band) messages
export async function processMediatorOOB(oob: string) {
  try {
    // Split the OOB string to extract the encoded payload
    const oobParts = oob.split('=');
    if (oobParts.length < 2) {
      throw new Error('Invalid OOB format. Missing encoded payload.');
    }

    const oobUrl = oobParts[1]; // Extract the encoded URL
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );

    // Validate the decoded OOB content
    if (!decodedOob.from) {
      throw new Error('Invalid OOB content. Missing "from" field.');
    }

    const didTo = decodedOob.from; // Extract the recipient DID

    // Generate a new DID using the DidPeerMethod
    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();

    // Create a resolver for PeerDID
    const resolver = new PeerDIDResolver();
    const secrets = [didPeer.privateKeyE, didPeer.privateKeyV];

    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);

    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);
    const mediatorDIDDoc = await resolver.resolve(decodedOob.from);

    // Find the mediator service endpoint
    const mediatorService = mediatorDIDDoc?.service?.find(
      (s) => s.type === 'DIDCommMessaging',
    );

    // Validate the mediator service endpoint
    if (!mediatorService || !mediatorService.serviceEndpoint) {
      throw new Error('Invalid mediator service endpoint format');
    }

    const mediatorEndpoint = mediatorService.serviceEndpoint;

    // Create a mediation request message
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

    const mediationRequest = new Message(val);

    // Pack the mediation request message for encryption
    const [packedMediationRequest] = await mediationRequest.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    // Send the packed mediation request to the mediator endpoint
    const response = await axios.post(
      mediatorEndpoint.uri,
      packedMediationRequest,
      {
        headers: {
          'Content-Type': 'application/didcomm-encrypted+json',
        },
      },
    );

    // Unpack the response message
    const [unpackedMessage] = await Message.unpack(
      JSON.stringify(response.data),
      resolver,
      secretsResolver,
      {},
    );

    const unpackedContent = unpackedMessage.as_value();

    // Validate the message type of the response
    if (unpackedContent.type !== MessageType.MediationResponse) {
      throw new Error(
        'Unexpected message type received for Mediation Response',
      );
    }

    const mediatorRoutingKey = unpackedContent.body.routing_did;
    const mediatorNewDID = unpackedContent.from;
    if (!mediatorRoutingKey || !mediatorNewDID) {
      throw new Error('Invalid mediation response format');
    }

    // Generate a new DID for routing
    const newDid =
      await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKey);

    // Create a keylist update message
    const keyupdate: IMessage = {
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.KeylistUpdate,
      body: {
        updates: [
          {
            recipient_did: newDid.did,
            action: 'add',
          },
        ],
      },
      from: didPeer.did,
      to: [didTo],
      created_time: Math.round(new Date().getTime() / 1000),
      return_route: 'all',
    };

    const keylistUpdate = new Message(keyupdate);

    // Pack the keylist update message for encryption
    const [packedKeylistUpdate] = await keylistUpdate.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    // Send the packed keylist update to the mediator endpoint
    const keylistResponse = await axios.post(
      mediatorEndpoint.uri,
      packedKeylistUpdate,
      {
        headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
      },
    );

    // Unpack the keylist update response message
    const [unpackedKeylistResponse] = await Message.unpack(
      JSON.stringify(keylistResponse.data),
      resolver,
      secretsResolver,
      {},
    );

    const responseContent = unpackedKeylistResponse.as_value();

    // Validate the message type of the keylist update response
    if (responseContent.type !== MessageType.KeylistUpdateResponse) {
      throw new Error('Unexpected message type received for Keylist Update');
    }

    // Validate the response content for the keylist update
    if (
      responseContent.body.updated[0]?.recipient_did !== newDid.did ||
      responseContent.body.updated[0]?.action !== 'add' ||
      responseContent.body.updated[0]?.result !== 'success'
    ) {
      throw new Error('Unexpected response in Keylist Update');
    }

    return responseContent.body;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Axios error response status: ${error.response?.status}, data: ${error.response?.data}`,
      );
    }
    if (error instanceof Error) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw new Error(`Unexpected error: ${String(error)}`);
    }
  }
}
