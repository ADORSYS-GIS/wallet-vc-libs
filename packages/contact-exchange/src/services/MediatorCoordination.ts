import { DIDMethodName } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidMethodFactory';
import { PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities/src/did-methods/IDidMethod';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { DidRepository } from '@adorsys-gis/multiple-did-identities/src/repository/DidRepository';
import { PeerDIDResolver } from 'did-resolver-lib';
import fetch from 'cross-fetch';
import { IMessage, Message, Secret, SecretsResolver } from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';

// Class to resolve secrets based on known secrets
class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  // Retrieve a secret by its ID
  async get_secret(secretId: string): Promise<Secret> {
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

// Refactored main function
export async function processMediatorOOB(oob: string) {
  try {
    const oobParts = oob.split('=');
    if (oobParts.length < 2) {
      throw new Error('Invalid OOB format. Missing encoded payload.');
    }

    const oobUrl = oobParts[1];
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );

    if (!decodedOob.from) {
      throw new Error('Invalid OOB content. Missing "from" field.');
    }

    const didTo = decodedOob.from;
    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();

    const resolver = new PeerDIDResolver();
    const secrets = [didPeer.privateKeyE, didPeer.privateKeyV];
    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);

    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);
    const mediatorDIDDoc = await resolver.resolve(decodedOob.from);

    const mediatorService = mediatorDIDDoc?.service?.find(
      (s) => s.type === 'DIDCommMessaging',
    );

    if (!mediatorService || !mediatorService.serviceEndpoint) {
      throw new Error('Invalid mediator service endpoint format');
    }

    const mediatorEndpoint = mediatorService.serviceEndpoint;

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

    const [packedMediationRequest] = await mediationRequest.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );
    console.log(packedMediationRequest);

    const mediationResponse = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      body: packedMediationRequest,
      headers: {
        'Content-Type': 'application/didcomm-encrypted+json',
      },
    });

    if (!mediationResponse.ok) {
      throw new Error(
        `Failed to send Mediation Request: ${mediationResponse.statusText}`,
      );
    }

    const responseJson = await mediationResponse.json();

    const [unpackedMessage] = await Message.unpack(
      JSON.stringify(responseJson),
      resolver,
      secretsResolver,
      {},
    );

    const unpackedContent = unpackedMessage.as_value();

    if (unpackedContent.type !== MessageType.MediationResponse) {
      throw new Error(
        'Unexpected message type received for Mediation Response',
      );
    }

    const mediatorRoutingKey = unpackedContent.body.routing_did;
    const mediatorNewDID = unpackedContent.from;
    if (!mediatorRoutingKey || !mediatorNewDID) {
      throw new Error('Mediation Response missing required fields');
    }

    const storeDid = new DidRepository();
    const newDid =
      await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKey);
    const method = DIDMethodName.Peer;

    await storeDid.createDidId(newDid, method);

    // Call the refactored Keylist Update function
    const keylistUpdateResponse = await handleKeylistUpdate(
      didTo,
      didPeer,
      newDid,
      resolver,
      secretsResolver,
      mediatorEndpoint,
    );

    return keylistUpdateResponse;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error: ${error.message}`);
    } else {
      throw new Error(`Unexpected error: ${String(error)}`);
    }
  }
}

// Extracted function to handle Keylist Update functionality
async function handleKeylistUpdate(
  didTo: string,
  didPeer: { did: string },
  newDid: { did: string },
  resolver: PeerDIDResolver,
  secretsResolver: SecretsResolver,
  mediatorEndpoint: { uri: string },
): Promise<unknown> {
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
  console.log(packedKeylistUpdate);

  // Send the packed keylist update to the mediator endpoint using fetch
  const response = await fetch(mediatorEndpoint.uri, {
    method: 'POST',
    body: packedKeylistUpdate,
    headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to send Keylist Update: ${response.statusText}`);
  }

  const keylistResponseData = await response.json();

  // Unpack the keylist update response message
  const [unpackedKeylistResponse] = await Message.unpack(
    JSON.stringify(keylistResponseData),
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
}
