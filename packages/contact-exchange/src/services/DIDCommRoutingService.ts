import {
  Message,
  DIDResolver,
  SecretsResolver,
  DIDDoc,
  Secret,
} from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './Messages.types';

class MediatorServiceDIDResolver implements DIDResolver {
  knownDids: DIDDoc[];

  constructor(knownDids: DIDDoc[]) {
    this.knownDids = knownDids;
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.knownDids.find((ddoc) => ddoc.id === did) || null;
  }
}

class MediatorServiceSecretsResolver implements SecretsResolver {
  knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) =>
      this.knownSecrets.find((secret) => secret.id === id),
    );
  }
}

export async function requestMediation(
  senderDid: string,
  mediatorDid: string,
  secretsResolver: SecretsResolver,
  didResolver: DIDResolver,
): Promise<string> {
  const messageBody = {
    type: 'request_mediation',
    from: senderDid,
  };

  const routedMessage = new Message({
    id: uuidv4(),
    typ: MessageTyp.Didcomm,
    type: MessageType.MediationRequest,
    from: senderDid,
    to: [mediatorDid],
    created_time: Math.round(new Date().getTime() / 1000),
    body: messageBody,
  });

  const [encryptedMsg] = await routedMessage.pack_encrypted(
    mediatorDid,
    senderDid,
    senderDid,
    didResolver,
    secretsResolver,
    {
      forward: false,
    },
  );

  return encryptedMsg;
}

export async function handleMediationResponse(
  encryptedMsg: string,
  didResolver: DIDResolver,
  secretsResolver: SecretsResolver,
): Promise<void> {
  const [unpackedMsg] = await Message.unpack(
    encryptedMsg,
    didResolver,
    secretsResolver,
    {},
  );

  const messageBody = unpackedMsg.as_value();
  if (messageBody.type === 'mediation_response') {
    console.log(`Received mediation response: ${JSON.stringify(messageBody)}`);
  }
}

export default { MediatorServiceDIDResolver, MediatorServiceSecretsResolver };
