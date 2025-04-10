import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import type { PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities/src/did-methods/IDidMethod';
import { DidRepository } from '@adorsys-gis/multiple-did-identities/src/repository/DidRepository';
import type { SecurityService } from '@adorsys-gis/multiple-did-identities/src/security/SecurityService';
import { encryptPrivateKeys } from '@adorsys-gis/multiple-did-identities/src/utils/encryptPrivateKeys';
import { sanitizeDidDoc } from '@adorsys-gis/multiple-did-identities/src/utils/sanitizeDidDoc';
import type { ServiceResponse } from '@adorsys-gis/status-service';
import { ServiceResponseStatus } from '@adorsys-gis/status-service';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from '@adorsys-gis/did-resolver-lib';
import type { IMessage, Secret, SecretsResolver } from 'didcomm';
import { Message } from 'didcomm';
import type { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';

// Define event channels
export enum DidEventChannel {
  ProcessMediatorOOB = 'ProcessMediatorOOB',
  MediationRequestSent = 'MediationRequestSent',
  MediationResponseReceived = 'MediationResponseReceived',
  KeylistUpdateSent = 'KeylistUpdateSent',
  KeylistUpdateResponseReceived = 'KeylistUpdateResponseReceived',
  Error = 'DidError',
}

// Shared error handler
function sharedErrorHandler(channel: DidEventChannel, eventBus: EventEmitter) {
  return (error: unknown) => {
    const response: ServiceResponse<Error> = {
      status: ServiceResponseStatus.Error,
      payload: error instanceof Error ? error : new Error(String(error)),
    };
    eventBus.emit(channel, response);
  };
}

// A helper function to convert base64Url to base64
function base64UrlToBase64(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
}

// Class to resolve secrets based on known secrets
export class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret> {
    const secret = this.knownSecrets.find((secret) => secret.id === secretId);
    if (!secret) {
      throw new Error(`Secret with ID '${secretId}' not found.`);
    }
    return secret;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    const foundSecrets = secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
    return foundSecrets;
  }
}

// Define return type interfaces
export interface ProcessMediatorOOBResult {
  messagingDid: string;
  mediatorDid: string;
}

export interface SendKeylistUpdateResult {
  recipientDID: string;
  mediatorDID: string;
}

// Service class to handle DID communication
export class DidService {
  private didRepository: DidRepository;

  constructor(
    public eventBus: EventEmitter,
    public securityService: SecurityService,
    private readonly secretPinNumber: number,
  ) {
    this.didRepository = new DidRepository(securityService);
  }

  public async processMediatorOOB(
    oob: string,
  ): Promise<ProcessMediatorOOBResult> {
    const channel = DidEventChannel.ProcessMediatorOOB;

    try {
      const oobParts = oob.split('=');
      if (oobParts.length < 2) {
        throw new Error('Invalid OOB format. Missing encoded payload.');
      }

      const oobUrl = oobParts[1];
      const decodedOob = JSON.parse(
        Buffer.from(base64UrlToBase64(oobUrl), 'base64').toString('utf-8'),
      );

      if (!decodedOob.from) {
        throw new Error('Invalid OOB content. Missing "from" field.');
      }

      const didTo = decodedOob.from;
      const didPeerMethod = new DidPeerMethod();
      const didPeer = await didPeerMethod.generateMethod2();

      await encryptPrivateKeys(
        didPeer,
        this.secretPinNumber,
        ['privateKeyV', 'privateKeyE'],
        this.securityService,
      );

      const didDoc = sanitizeDidDoc(didPeer);

      await this.didRepository.createDidId(didDoc);

      const didIdentity =
        await this.didRepository.getADidWithDecryptedPrivateKeys(
          didDoc.did,
          this.secretPinNumber,
        );
      if (!didIdentity) {
        throw new Error('Failed to retrieve DID identity with decrypted keys');
      }

      const resolver = new PeerDIDResolver();

      const secrets = [
        didIdentity.decryptedPrivateKeys['privateKeyE'],
        didIdentity.decryptedPrivateKeys['privateKeyV'],
      ].filter((secret) => secret !== undefined);

      const privateKeySecrets = secrets.filter(
        (secret): secret is PrivateKeyJWK =>
          'id' in secret && 'type' in secret && 'privateKeyJwk' in secret,
      );

      const updatedSecrets = this.prependDidToSecretIds(
        privateKeySecrets,
        didDoc.did,
      );

      const secretsResolver = new DidcommSecretsResolver(updatedSecrets);

      const mediationRequest: IMessage = {
        id: uuidv4(),
        typ: MessageTyp.Didcomm,
        type: MessageType.MediationRequest,
        body: { messagesspecificattribute: 'and its value' },
        from: didDoc.did,
        to: [didTo],
        created_time: Math.round(Date.now() / 1000),
        return_route: 'all',
      };

      const message = new Message(mediationRequest);

      const [packedMediationRequest] = await message.pack_encrypted(
        didTo,
        didDoc.did,
        didDoc.did,
        resolver,
        secretsResolver,
        { forward: false },
      );

      this.eventBus.emit(channel, {
        status: ServiceResponseStatus.Success,
        payload: packedMediationRequest,
      });

      const mediatorDIDDoc = await resolver.resolve(decodedOob.from);

      if (
        !mediatorDIDDoc ||
        !mediatorDIDDoc.service ||
        !mediatorDIDDoc.service[0].serviceEndpoint ||
        !mediatorDIDDoc.service[0].serviceEndpoint.uri
      ) {
        throw new Error('Invalid mediator DID or service endpoint');
      }

      const mediatorEndpoint = mediatorDIDDoc.service[0].serviceEndpoint;

      const mediationResponse = await fetch(mediatorEndpoint.uri, {
        method: 'POST',
        body: packedMediationRequest,
        headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
      });

      if (!mediationResponse.ok) {
        throw new Error(
          `Failed to send Mediation Deny message: ${mediationResponse.statusText}`,
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

      const newDid =
        await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKey);

      // Store the DID generated using the mediator routing keys
      await encryptPrivateKeys(
        newDid,
        this.secretPinNumber,
        ['privateKeyV', 'privateKeyE'],
        this.securityService,
      );

      const didDocNew = sanitizeDidDoc(newDid);
      await this.didRepository.createDidId(didDocNew);

      // Call the new method to handle keylist update
      const updatedDid = await this.sendKeylistUpdate(
        didDoc.did,
        mediatorNewDID,
        didDocNew.did,
        mediatorEndpoint.uri,
        resolver,
        secretsResolver,
      );

      this.eventBus.emit(DidEventChannel.MediationResponseReceived, {
        status: ServiceResponseStatus.Success,
        payload: updatedDid,
        mediatorNewDID,
      });

      return {
        messagingDid: updatedDid.recipientDID,
        mediatorDid: mediatorNewDID,
      };
    } catch (error: unknown) {
      this.sharedErrorHandler(channel)(error);
      throw error;
    }
  }

  public async sendKeylistUpdate(
    fromDid: string,
    toDid: string,
    recipientDid: string,
    mediatorEndpointUri: string,
    resolver: PeerDIDResolver,
    secretsResolver: DidcommSecretsResolver,
  ): Promise<SendKeylistUpdateResult> {
    const keyupdate: IMessage = {
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.KeylistUpdate,
      body: {
        updates: [
          {
            recipient_did: recipientDid,
            action: 'add',
          },
        ],
      },
      from: fromDid,
      to: [toDid],
      created_time: Math.round(Date.now() / 1000),
      return_route: 'all',
    };

    const keylistUpdate = new Message(keyupdate);

    const [packedKeylistUpdate] = await keylistUpdate.pack_encrypted(
      toDid,
      fromDid,
      fromDid,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const keylistResponse = await fetch(mediatorEndpointUri, {
      method: 'POST',
      body: packedKeylistUpdate,
      headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    });

    if (!keylistResponse.ok) {
      throw new Error(
        `Failed to send Keylist Update message: ${keylistResponse.statusText}`,
      );
    }

    const keylistResponseJson = await keylistResponse.json();

    const [unpackedKeylistResponse] = await Message.unpack(
      JSON.stringify(keylistResponseJson),
      resolver,
      secretsResolver,
      {},
    );

    const recipientDidResponse = unpackedKeylistResponse.as_value();
    const recipientDID = recipientDidResponse.body.updated[0].recipient_did;
    const MediatorUpdatedDID = recipientDidResponse.from;

    if (!recipientDID || !MediatorUpdatedDID) {
      throw new Error('Keylist Update missing required fields');
    }

    return {
      recipientDID: recipientDid,
      mediatorDID: MediatorUpdatedDID,
    };
  }

  private prependDidToSecretIds(
    secrets: PrivateKeyJWK[],
    did: string,
  ): PrivateKeyJWK[] {
    return secrets.map((secret) => ({
      ...secret,
      id: `${did}${secret.id.split(did).pop()}`,
    }));
  }

  private sharedErrorHandler(channel: DidEventChannel) {
    return sharedErrorHandler(channel, this.eventBus);
  }
}
