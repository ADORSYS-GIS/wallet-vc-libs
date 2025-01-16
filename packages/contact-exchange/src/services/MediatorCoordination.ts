import { CloneMethodArgs } from '@adorsys-gis/cloning-decorator';
import { DIDMethodName } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidMethodFactory';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { PrivateKeyJWK } from '@adorsys-gis/multiple-did-identities/src/did-methods/IDidMethod';
import { DidRepository } from '@adorsys-gis/multiple-did-identities/src/repository/DidRepository';
import {
  ServiceResponse,
  ServiceResponseStatus,
} from '@adorsys-gis/status-service';
import fetch from 'cross-fetch';
import { PeerDIDResolver } from 'did-resolver-lib';
import { IMessage, Message, Secret, SecretsResolver } from 'didcomm-node';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';

// Define event channels
enum DidEventChannel {
  ProcessMediatorOOB = 'ProcessMediatorOOB',
  MediationRequestSent = 'MediationRequestSent',
  MediationResponseReceived = 'MediationResponseReceived',
  KeylistUpdateSent = 'KeylistUpdateSent',
  KeylistUpdateResponseReceived = 'KeylistUpdateResponseReceived',
  Error = 'DidError',
}

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

// Service class to handle DID communication
export class DidService {
  private didRepository: DidRepository;

  constructor(private eventBus: EventEmitter) {
    this.didRepository = new DidRepository();
  }

  public async processMediatorOOB(oob: string): Promise<unknown> {
    const channel = DidEventChannel.ProcessMediatorOOB;

    try {
      const oobParts = oob.split('=');
      if (oobParts.length < 2) {
        throw new Error('Invalid OOB format. Missing encoded payload.');
      }
      console.log('OOB parts:', oobParts);

      const oobUrl = oobParts[1];
      const decodedOob = JSON.parse(
        Buffer.from(oobUrl, 'base64url').toString('utf-8'),
      );
      console.log('Decoded OOB:', decodedOob);

      if (!decodedOob.from) {
        throw new Error('Invalid OOB content. Missing "from" field.');
      }

      const didTo = decodedOob.from;
      const didPeerMethod = new DidPeerMethod();
      const didPeer = await didPeerMethod.generateMethod2();
      console.log('didPeer:', didPeer);

      const resolver = new PeerDIDResolver();
      const secrets = [didPeer.privateKeyE, didPeer.privateKeyV];
      const updatedSecrets = this.prependDidToSecretIds(secrets, didPeer.did);
      console.log('updatedSecrets:', updatedSecrets);

      const secretsResolver = new DidcommSecretsResolver(updatedSecrets);
      console.log('secretsResolver:', secretsResolver);

      const mediatorDIDDoc = await resolver.resolve(didPeer.did);
      console.log('DIDDoc:', mediatorDIDDoc);

      const mediatorService = mediatorDIDDoc?.service?.find(
        (s) => s.type === 'DIDCommMessaging',
      );

      if (!mediatorService || !mediatorService.serviceEndpoint) {
        throw new Error('Invalid mediator service endpoint format');
      }

      const mediatorEndpoint = mediatorService.serviceEndpoint;
      console.log('mediator endpoint:', mediatorEndpoint);

      const val: IMessage = {
        id: uuidv4(),
        typ: MessageTyp.Didcomm,
        type: MessageType.MediationRequest,
        body: { messagesspecificattribute: 'and its value' },
        from: didPeer.did,
        to: [didTo],
        created_time: Math.round(new Date().getTime() / 1000),
        return_route: 'all',
      };

      console.log('mediation request:', val);

      const mediationRequest = new Message(val);
      const [packedMediationRequest] = await mediationRequest.pack_encrypted(
        didTo,
        didPeer.did,
        didPeer.did,
        resolver,
        secretsResolver,
        { forward: false },
      );

      this.eventBus.emit(channel, {
        status: ServiceResponseStatus.Success,
        payload: packedMediationRequest,
      });
      console.log(packedMediationRequest);

      const mediationResponse = await fetch(mediatorEndpoint.uri, {
        method: 'POST',
        body: packedMediationRequest,
        headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
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

      const newDid =
        await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKey);
      const method = DIDMethodName.Peer;

      await this.didRepository.createDidId(newDid, method);
      this.eventBus.emit(DidEventChannel.MediationResponseReceived, {
        status: ServiceResponseStatus.Success,
        payload: unpackedContent,
      });

      // Call the refactored Keylist Update function
      const keylistUpdateResponse = await this.handleKeylistUpdate(
        didTo,
        didPeer,
        newDid,
        resolver,
        secretsResolver,
        mediatorEndpoint,
      );
      this.eventBus.emit(DidEventChannel.KeylistUpdateResponseReceived, {
        status: ServiceResponseStatus.Success,
        payload: keylistUpdateResponse,
      });

      return keylistUpdateResponse;
    } catch (error: unknown) {
      const response: ServiceResponse<Error> = {
        status: ServiceResponseStatus.Error,
        payload: error instanceof Error ? error : new Error(String(error)),
      };
      this.eventBus.emit(DidEventChannel.Error, response);
      throw response;
    }
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

  // private getMediatorServiceEndpoint(mediatorDIDDoc: unknown ): { uri: string } {
  //   const mediatorService = mediatorDIDDoc?.service?.find(
  //     (s) => s.type === DID_COMM_MESSAGING_TYPE,
  //   );

  //   if (!mediatorService || !mediatorService.serviceEndpoint) {
  //     throw new Error('Invalid mediator service endpoint format');
  //   }

  //   return { uri: mediatorService.serviceEndpoint };
  // }

  private async handleKeylistUpdate(
    didTo: string,
    didPeer: { did: string },
    newDid: { did: string },
    resolver: PeerDIDResolver,
    secretsResolver: SecretsResolver,
    mediatorEndpoint: { uri: string },
  ): Promise<unknown> {
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
    const [packedKeylistUpdate] = await keylistUpdate.pack_encrypted(
      didTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    this.eventBus.emit(DidEventChannel.KeylistUpdateSent, {
      status: ServiceResponseStatus.Success,
      payload: packedKeylistUpdate,
    });

    const response = await fetch(mediatorEndpoint.uri, {
      method: 'POST',
      body: packedKeylistUpdate,
      headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to send Keylist Update: ${response.statusText}`);
    }

    const keylistResponseData = await response.json();
    const [unpackedKeylistResponse] = await Message.unpack(
      JSON.stringify(keylistResponseData),
      resolver,
      secretsResolver,
      {},
    );

    const responseContent = unpackedKeylistResponse.as_value();
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
  }
}

// Decorate the DidService class to clone method arguments
const decorate = CloneMethodArgs({ exclude: [EventEmitter] });
export const DecoratedDidService = decorate(DidService);
