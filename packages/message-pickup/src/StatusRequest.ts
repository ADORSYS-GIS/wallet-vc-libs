import {
  Secret,
  IMessage,
  Message,
  SecretsResolver,
  Base64AttachmentData,
} from 'didcomm';
import { PeerDIDResolver } from 'did-resolver-lib';
import { DidRepository } from '@adorsys-gis/multiple-did-identities';

import {
  DidIdentityWithDecryptedKeys,
  PrivateKeyJWK,
} from '@adorsys-gis/multiple-did-identities';
import { secretsTest } from './tests/helpers';

export async function processStatusRequest(
  mediatorDid: string,
  aliceDidForMediator: string,
  didRepository: DidRepository,
  test: boolean,
  aliceRecipientDid: string = '' 
) {
  console.log('processStatusRequest');
  const secretPinNumber = 1234; // Replace with the actual pin number
  const statusRequestService = new StatusRequestService(
    didRepository,
    secretPinNumber,
  );

  try {
    let secrets, secrets2;
    if (test) {
      secrets = secretsTest;
    } else {
      secrets =
        await statusRequestService.retrieveSenderDidSecrets(
          aliceDidForMediator,
        );
        secrets2 =
        await statusRequestService.retrieveSenderDidSecrets(
          aliceRecipientDid,
        );
    }

    console.log('Retrieved Secrets:', secrets);
    console.log('Retrieved Secrets2:', secrets2);


    const val: IMessage = {
      id: generateUuid(),
      typ: 'application/didcomm-plain+json',
      type: 'https://didcomm.org/messagepickup/3.0/status-request',
      body: {},
      from: aliceDidForMediator,
      to: [mediatorDid],
      created_time: Math.round(Date.now() / 1000),
      return_route: 'all',
    };

    console.log('status-request out message: ', val);

    const resolver = new PeerDIDResolver();

    const statusRequest = new Message(val);

    const secretsResolver = new DidcommSecretsResolver(secrets);

    const [packedStatusRequest] = await statusRequest.pack_encrypted(
      mediatorDid,
      aliceDidForMediator,
      aliceDidForMediator,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const mediatorDIDDoc = await resolver.resolve(mediatorDid);

    if (
      !mediatorDIDDoc ||
      !mediatorDIDDoc.service ||
      !mediatorDIDDoc.service[0].serviceEndpoint
    ) {
      throw new Error('Invalid mediator DID or service endpoint');
    }
    const mediatorEndpoint = mediatorDIDDoc.service[0].serviceEndpoint;

    console.log('mediatorEndpoint: ', mediatorEndpoint);

    // Log the request details
    const headers = { 'Content-Type': 'application/didcomm-encrypted+json' };
    console.log('Sending request to:', mediatorEndpoint.uri);
    console.log('Request headers:', headers);
    console.log('Request body:', packedStatusRequest);

    // Send the packed message to the mediator endpoint
    const resp3 = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      headers: headers,
      body: packedStatusRequest,
    });

    console.log('Response status:', resp3.status);
    console.log('Response status text:', resp3.statusText);
    console.log('Response headers:', resp3.headers.get('Content-Type'));

    // Log the response body for more details
    const responseBody = await resp3.text();
    console.log('Response body:', responseBody);

    if (!resp3.ok) {
      throw new Error(
        `Failed to send message: ${resp3.statusText} - ${responseBody}`,
      );
    }

    if (!responseBody) {
      throw new Error('Response body is empty');
    }

    const responseJson = JSON.parse(responseBody);
    console.log('Response JSON:', responseJson);

    const [unpackedMessage] = await Message.unpack(
      JSON.stringify(responseJson),
      resolver,
      secretsResolver,
      {},
    );

    console.log('unpackedMessage: ', unpackedMessage.as_value());
  } catch (error) {
    console.error('Error processing status request:', error);
  }
}

export async function processDeliveryRequest(
  mediatorDid: string,
  aliceDidForMediator: string,
  didRepository: DidRepository,
) {
  console.log('processStatusRequest');
  const secretPinNumber = 1234; // Replace with the actual pin number
  const statusRequestService = new StatusRequestService(
    didRepository,
    secretPinNumber,
  );

  try {
    // const secrets = await statusRequestService.retrieveSenderDidSecrets(aliceDidForMediator);
    // For local testing:
    const secrets = secretsTest;

    console.log('Retrieved Secrets:', secrets);

    const plainMessage: IMessage = {
      id: generateUuid(),
      typ: 'application/didcomm-encrypted+json',
      type: 'https://didcomm.org/messagepickup/3.0/delivery-request',
      body: { limit: 1 },
      from: aliceDidForMediator,
      to: [mediatorDid],
      created_time: Math.round(Date.now() / 1000),
      return_route: 'all',
    };

    console.log('delivery-request out message: ', plainMessage);

    const resolver = new PeerDIDResolver();

    const mediationRequest = new Message(plainMessage);

    const secretsResolver = new DidcommSecretsResolver(secrets);

    const [packedMediationRequest] = await mediationRequest.pack_encrypted(
      mediatorDid,
      aliceDidForMediator,
      aliceDidForMediator,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const mediatorDIDDoc = await resolver.resolve(mediatorDid);

    if (
      !mediatorDIDDoc ||
      !mediatorDIDDoc.service ||
      !mediatorDIDDoc.service[0].serviceEndpoint
    ) {
      throw new Error('Invalid mediator DID or service endpoint');
    }
    const mediatorEndpoint = mediatorDIDDoc.service[0].serviceEndpoint;

    // Log the request details
    const headers = { 'Content-Type': 'application/didcomm-encrypted+json' };

    // Send the packed message to the mediator endpoint
    const resp3 = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      headers: headers,
      body: packedMediationRequest,
    });

    // Log the response body for more details
    const responseBody = await resp3.text();

    if (!resp3.ok) {
      throw new Error(
        `Failed to send message: ${resp3.statusText} - ${responseBody}`,
      );
    }

    if (!responseBody) {
      throw new Error('Response body is empty');
    }

    const responseJson = JSON.parse(responseBody);

    const [unpackedMessage] = await Message.unpack(
      JSON.stringify(responseJson),
      resolver,
      secretsResolver,
      {},
    );

    console.log('unpackedMessage: ', unpackedMessage.as_value());

    // Cast unpackedMessage to IMessage
    const messageContent: IMessage = unpackedMessage.as_value(); // Assuming as_value() returns IMessage
    console.log('Unpacked Message:', messageContent);

    const packetMessage = messageContent.attachments?.[0].data;

    let decodedData = ''; // Declare it outside to use later

    if (packetMessage && 'base64' in packetMessage) {
      const base64Data = (packetMessage as Base64AttachmentData).base64;

      if (base64Data) {
        decodedData = JSON.parse(
          Buffer.from(base64Data, 'base64').toString('utf-8'),
        );
        console.log(decodedData);
      } else {
        console.error('Base64 data is empty.');
      }
    } else {
      console.error('No base64 data found.');
    }

    console.log('decodedData:', decodedData);
    console.log('secretsResolver', secretsResolver);

    const [unpackedMessageTest] = await Message.unpack(
      JSON.stringify(decodedData),
      resolver,
      secretsResolver,
      {},
    );

    console.log('Message!:', unpackedMessageTest.as_value().body.content);
  } catch (error) {
    console.error('Error processing status request:', error);
  }
}

class StatusRequestService {
  private didRepository: DidRepository;
  private secretPinNumber: number;

  constructor(didRepository: DidRepository, secretPinNumber: number) {
    this.didRepository = didRepository;
    this.secretPinNumber = secretPinNumber;
  }

  public async retrieveSenderDidSecrets(senderDid: string): Promise<Secret[]> {
    let privateKeys: DidIdentityWithDecryptedKeys | null;
    console.log('senderDid: ', senderDid);
    try {
      privateKeys =
        await this.didRepository.getADidWithDecryptedPrivateKeysTEST(
          senderDid,
          this.secretPinNumber,
        );
    } catch (e) {
      console.error(e);
      throw new Error(
        'Repository failure while retrieving private keys for senderDid',
      );
    }

    if (!privateKeys) {
      throw new Error('Inexistent private keys for senderDid');
    }
    console.log('privateKeys: ', privateKeys);
    const secrets = Object.values(privateKeys.decryptedPrivateKeys).filter(
      (key): key is PrivateKeyJWK => 'privateKeyJwk' in key,
    );

    if (secrets.length == 0) {
      throw new Error('Cannot proceed with no sender secrets');
    }

    return secrets;
  }
}

/**
 * Generates a UUID for random identifiers.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Returns current unix timestamp in seconds.
 */
export function currentTimestampInSecs(): number {
  return Math.floor(new Date().getTime() / 1000);
}

// Class to resolve secrets based on known secrets
export class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret> {
    console.log('secretId', secretId);
    const secret = this.knownSecrets.find((secret) => secret.id === secretId);
    if (!secret) {
      throw new Error(`Secret with ID '${secretId}' not found.`);
    }
    return secret;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    console.log('secretIds', secretIds);

    const foundSecrets = secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
    return foundSecrets;
  }
}
