import type {
  Secret,
  IMessage,
  SecretsResolver,
  Base64AttachmentData,
} from 'didcomm';
import {
  Message,
} from 'didcomm';
import { PeerDIDResolver } from 'did-resolver-lib';
import type { DidRepository, DidIdentityWithDecryptedKeys, PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities';

import { secretsTest } from './utils/helpers';
import { currentTimestampInSecs, generateUuid } from './utils/misc';
import { DELIVERY_REQUEST_TYPE_URI, ENCRYPTED_DIDCOMM_MESSAGE_TYPE, PLAIN_DIDCOMM_MESSAGE_TYPE, STATUS_REQUEST_TYPE_URI } from './types/constants';
import type {
  Message as MessageModel,
  MessageRepository,
} from '@adorsys-gis/message-service';

export class StatusRequestHandler {
  private readonly didRepository: DidRepository;
  private readonly secretPinNumber: number;
  private readonly messageRepository: MessageRepository;

  constructor(didRepository: DidRepository, secretPinNumber: number, messageRepository: MessageRepository) {
    this.didRepository = didRepository;
    this.secretPinNumber = secretPinNumber;
    this.messageRepository = messageRepository
  }

  public async processStatusRequest(
    mediatorDid: string,
    aliceDidForMediator: string,
    test: boolean,
    aliceRecipientDid: string = ''
  ) {
    console.log('processStatusRequest');
    let secrets, secrets2;
    if (test) {
      secrets = secretsTest;
    } else {
      secrets = await this.retrieveSenderDidSecrets(aliceDidForMediator);
      secrets2 = await this.retrieveSenderDidSecrets(aliceRecipientDid);
    }

    console.log('Retrieved Secrets:', secrets);
    console.log('Retrieved Secrets2:', secrets2);

    const val: IMessage = {
      id: generateUuid(),
      typ: PLAIN_DIDCOMM_MESSAGE_TYPE,
      type: STATUS_REQUEST_TYPE_URI,
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

    const mediatorEndpoint = await this.resolveMediatorEndpoint(resolver, mediatorDid);
    console.log('mediatorEndpoint: ', mediatorEndpoint);

    const headers = { 'Content-Type': ENCRYPTED_DIDCOMM_MESSAGE_TYPE };
    console.log('Sending request to:', mediatorEndpoint.uri);
    console.log('Request headers:', headers);
    console.log('Request body:', packedStatusRequest);

    const resp3 = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      headers: headers,
      body: packedStatusRequest,
    });

    console.log('Response status:', resp3.status);
    console.log('Response status text:', resp3.statusText);
    console.log('Response headers:', resp3.headers.get('Content-Type'));

    const responseBody = await resp3.text();
    console.log('Response body:', responseBody);

    if (!resp3.ok) {
      throw new Error(`Failed to send message: ${resp3.statusText} - ${responseBody}`);
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
  }

  public async processDeliveryRequest(
    mediatorDid: string,
    aliceDidForMediator: string,
  ) {
    console.log('processDeliveryRequest');
    const secrets = secretsTest; // For local testing
    console.log('Retrieved Secrets:', secrets);

    const plainMessage: IMessage = {
      id: generateUuid(),
      typ: PLAIN_DIDCOMM_MESSAGE_TYPE,
      type: DELIVERY_REQUEST_TYPE_URI,
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

    const mediatorEndpoint = await this.resolveMediatorEndpoint(resolver, mediatorDid);

    const headers = { 'Content-Type': ENCRYPTED_DIDCOMM_MESSAGE_TYPE };

    const responseBody = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      headers: headers,
      body: packedMediationRequest,
    }).then(resp => resp.text());

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

    const messageContent: IMessage = unpackedMessage.as_value();
    console.log('Unpacked Message:', messageContent);

    const packetMessages = messageContent.attachments; // Get all attachments
    console.log('packetMessages: ', packetMessages);

    // Check if packetMessages is defined and handle accordingly
    if (packetMessages && packetMessages.length > 0) {
      for (const packetMessage of packetMessages) { // Iterate over each attachment
        console.log('Processing packetMessage: ', packetMessage);
        
        if (typeof packetMessage.data === 'string') {
          // If it's already a string, you can use it directly
          const persistedMessage = await this.persistMessage(
            packetMessage.data,
            mediatorDid,
            aliceDidForMediator,
            packetMessage as unknown as Message,
          );
          console.log(`Message ${persistedMessage.id} successfully persisted`);
        } else if ('base64' in packetMessage.data) {
          // If it's a base64 encoded string, decode it
          const base64Data = (packetMessage.data as Base64AttachmentData).base64;
          const decodedMessage = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));

          const [unpackedMessage] = await Message.unpack(
            JSON.stringify(decodedMessage),
            resolver,
            secretsResolver,
            {},
          );
          console.log('unpackedMessage!:', unpackedMessage.as_value());
      
          console.log('Message!:', unpackedMessage.as_value().body.content);

          const persistedMessage = await this.persistMessage(
            unpackedMessage.as_value().body.content,
            mediatorDid,
            aliceDidForMediator,
            unpackedMessage,
          );
          
          console.log(`Message ${persistedMessage.id} successfully persisted`);
        } else {
          console.error('Unsupported packetMessage format:', packetMessage.data);
        }
      }
    } else {
      console.error('No packetMessages found in the attachments.');
    }
  }

  private async retrieveSenderDidSecrets(senderDid: string): Promise<Secret[]> {
    let privateKeys: DidIdentityWithDecryptedKeys | null;
    console.log('senderDid: ', senderDid);
    try {
      privateKeys = await this.didRepository.getADidPrivateKeysMini(senderDid, this.secretPinNumber);
    } catch (e) {
      console.error(e);
      throw new Error('Repository failure while retrieving private keys for senderDid');
    }

    if (!privateKeys) {
      throw new Error('Inexistent private keys for senderDid');
    }
    console.log('privateKeys: ', privateKeys);
    const secrets = Object.values(privateKeys.decryptedPrivateKeys).filter(
      (key): key is PrivateKeyJWK => 'privateKeyJwk' in key,
    );

    if (secrets.length === 0) {
      throw new Error('Cannot proceed with no sender secrets');
    }

    return secrets;
  }

  private async resolveMediatorEndpoint(resolver: PeerDIDResolver, mediatorDid: string) {
    const mediatorDIDDoc = await resolver.resolve(mediatorDid);
    if (!mediatorDIDDoc || !mediatorDIDDoc.service || !mediatorDIDDoc.service[0].serviceEndpoint) {
      throw new Error('Invalid mediator DID or service endpoint');
    }
    return mediatorDIDDoc.service[0].serviceEndpoint;
  }

    /**
   * Persists sent message.
   */
    private async persistMessage(
      message: string,
      recipientDid: string,
      senderDid: string,
      basicMessage: Message,
    ): Promise<MessageModel> {
      const { id, created_time } = basicMessage.as_value();
      const timestamp = new Date(created_time ?? currentTimestampInSecs());
  
      const messageModel: MessageModel = {
        id,
        text: message,
        sender: senderDid,
        contactId: recipientDid,
        timestamp,
        direction: 'out',
      };
  
      return await this.messageRepository.create(messageModel);
    }
}

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
    return secretIds.filter((id) => this.knownSecrets.some((secret) => secret.id === id));
  }
}
