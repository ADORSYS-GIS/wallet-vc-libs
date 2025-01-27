import { generateUuid, currentTimestampInSecs, isHttpUrl } from '../utils';
import { MediatorServiceEndpoint } from './types/routing';
import { fetch } from 'cross-fetch';
import { DIDResolver, Message, Secret, ServiceKind } from 'didcomm';

import {
  Message as MessageModel,
  MessageRepository,
} from '@adorsys-gis/message-service';

import {
  DidRepository,
  PrivateKeyJWK,
} from '@adorsys-gis/multiple-did-identities';

import {
  isDIDCommMessagingServiceEndpoint,
  StaticSecretsResolver,
} from '../utils/didcomm';

import {
  BASIC_MESSAGE_TYPE_URI,
  DIDCOMM_MESSAGING_SERVICE_TYPE,
  ENCRYPTED_DIDCOMM_MESSAGE_TYPE,
  PLAIN_DIDCOMM_MESSAGE_TYPE,
} from './types/constants';

/**
 * Routes messages as governed by the DIDComm Routing Protocol.
 *
 * @see https://identity.foundation/didcomm-messaging/spec/#routing-protocol-20
 */
export class MessageRouter {
  /**
   * @param didResolver - A DID resolver for resolving DID addresses.
   * @param didRepository - A repository for retrieving wallet's secret keys.
   * @param messageRepository - A repository for persisting sent messages.
   * @param secretPinNumber - The secret PIN number for decrypting data from safe storage.
   */
  public constructor(
    private readonly didResolver: DIDResolver,
    private readonly didRepository: DidRepository,
    private readonly messageRepository: MessageRepository,
    private readonly secretPinNumber: number,
  ) {}

  /**
   * Sends a basic message to another party, routing it through its mediator.
   *
   * @param message - The textual content of the message to send.
   * @param recipientDid - The DID address of the receiving party.
   * @param senderDid - The DID address of the sending party.
   */
  public async routeForwardMessage(
    message: string,
    recipientDid: string,
    senderDid: string,
  ): Promise<void> {
    // Construct formal basic message
    const basicMessage = this.buildBasicMessage(
      message,
      recipientDid,
      senderDid,
    );

    // Prepare secrets resolver
    const secrets = await this.retrieveSenderDidSecrets(senderDid);
    const secretsResolver = new StaticSecretsResolver(secrets);

    // Identify DIDComm endpoints of the recipient's mediator
    const mediatorEndpoints = await this.extractMediatorEndpoints(recipientDid);
    const mediatorEnpointUrls = mediatorEndpoints.flatMap((e) => e.uri);

    // Pack into a forward message
    const [packedMessage] = await basicMessage.pack_encrypted(
      recipientDid,
      senderDid,
      null,
      this.didResolver,
      secretsResolver,
      {},
    );

    // Route message to mediator
    let messageWasRouted = false;
    for (const url of mediatorEnpointUrls) {
      try {
        console.log('Routing message...');
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': ENCRYPTED_DIDCOMM_MESSAGE_TYPE },
          body: packedMessage,
        });

        if (response.status == 202) {
          console.log('Message successfully routed');
          messageWasRouted = true;
          break;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    // Throw error if message was not routed so far
    if (!messageWasRouted) {
      throw new Error('Message could not be routed successfully');
    }

    // Save sent message
    await this.persistMessage(message, recipientDid, senderDid, basicMessage);
  }

  /**
   * Wraps textual content into a basic message structure.
   *
   * @see https://didcomm.org/basicmessage/2.0
   */
  private buildBasicMessage(
    message: string,
    recipientDid: string,
    senderDid: string,
  ): Message {
    return new Message({
      id: generateUuid(),
      typ: PLAIN_DIDCOMM_MESSAGE_TYPE,
      type: BASIC_MESSAGE_TYPE_URI,
      from: senderDid,
      to: [recipientDid],
      created_time: currentTimestampInSecs(),
      body: { content: message },
    });
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

  /**
   * Retrieves the private keys of the sender DID.
   */
  private async retrieveSenderDidSecrets(senderDid: string): Promise<Secret[]> {
    const privateKeys =
      await this.didRepository.getADidWithDecryptedPrivateKeys(
        senderDid,
        this.secretPinNumber,
      );

    if (!privateKeys) {
      throw new Error('Could not retrieve private keys for senderDid');
    }

    const secrets = Object.values(privateKeys.decryptedPrivateKeys).filter(
      (key): key is PrivateKeyJWK => 'privateKeyJwk' in key,
    );

    return secrets;
  }

  /**
   * Extracts potential service endpoints (alongside corresponding routing keys)
   * for the next hop of the forward message route at the mediator.
   */
  private async extractMediatorEndpoints(
    recipientDid: string,
  ): Promise<MediatorServiceEndpoint[]> {
    // Collect exposed DIDComm services
    const serviceEndpoints = (
      await this.resolveDIDCommServiceEndpoints(recipientDid)
    ).filter(isDIDCommMessagingServiceEndpoint);

    // TODO: Which service endpoint is the didcomm library considering?

    // Process service endpoints
    const mediatorEndpoints = await Promise.all(
      serviceEndpoints.map(async (serviceEndpoint) => {
        const uri = await this.normalizeServiceEndpointUri(serviceEndpoint.uri);
        const routingKeys = Array.isArray(serviceEndpoint.routing_keys)
          ? serviceEndpoint.routing_keys
          : (serviceEndpoint as unknown as { routingKeys: string[] })[
              'routingKeys'
            ];

        return { uri, routingKeys };
      }),
    );

    // Filter out entries with no URLs
    return mediatorEndpoints.filter((e) => e.uri.length > 0);
  }

  /**
   * Normalize service endpoint URI as an array of URLs,
   * dereferencing or dismissing non-HTTP(S) endpoints.
   */
  private async normalizeServiceEndpointUri(
    serviceEndpointUri: string,
  ): Promise<string[]> {
    // If the URI is a DID, we dereference it in search of URL endpoints
    if (serviceEndpointUri.startsWith('did:')) {
      const serviceEndpoints =
        await this.resolveDIDCommServiceEndpoints(serviceEndpointUri);

      return serviceEndpoints
        .map((serviceEndpoint) => {
          let uri = '';
          if (typeof serviceEndpoint == 'string') {
            uri = serviceEndpoint;
          } else if (isDIDCommMessagingServiceEndpoint(serviceEndpoint)) {
            uri = serviceEndpoint.uri;
          }

          return isHttpUrl(uri) ? uri : null;
        })
        .filter((url) => url != null);
    }

    // If the URI is of a scheme not supported, silently dismiss it.
    if (!isHttpUrl(serviceEndpointUri)) {
      return [];
    }

    // Wrap HTTP URL into an array for convenience
    return [serviceEndpointUri];
  }

  /**
   * Resolves DID for DIDCommMessaging service endpoints.
   */
  private async resolveDIDCommServiceEndpoints(
    did: string,
  ): Promise<ServiceKind[]> {
    // Resolve DID to retrieve exposed services
    const diddoc = await this.didResolver.resolve(did);
    let services = diddoc?.service;

    // Normalize services to the array variant
    if (!Array.isArray(services)) {
      services = services ? [services] : [];
    }

    // Filter only DIDComm services
    return services
      .filter((service) => service.type == DIDCOMM_MESSAGING_SERVICE_TYPE)
      .map((service) => service.serviceEndpoint);
  }
}
