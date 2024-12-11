import {
  Message,
  DIDResolver,
  SecretsResolver,
  DIDDoc,
  Secret,
} from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageType, MessageTyp } from './Messages.types';
import { validEncodedUrl } from '../tests/OOBTestFixtures';

class MessagingServiceDIDResolver implements DIDResolver {
  knownDids: DIDDoc[];

  constructor(knownDids: DIDDoc[]) {
    this.knownDids = knownDids;
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.knownDids.find((ddoc) => ddoc.id === did) || null;
  }
}

class MessagingServiceSecretsResolver implements SecretsResolver {
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

export async function sendContactRequest(
  didResolver: DIDResolver,
  secretsResolver: SecretsResolver,
  senderDid: string,
  receiverDid: string,
): Promise<string> {
  const messageBody = {
    type: validEncodedUrl,
    from: senderDid,
  };

  const routedMessage = new Message({
    id: uuidv4(),
    typ: MessageTyp.Didcomm,
    type: MessageType.RoutingForward,
    from: senderDid,
    to: [receiverDid],
    created_time: Math.round(Date.now() / 1000),
    body: messageBody,
  });

  const [encryptedMessage] = await routedMessage.pack_encrypted(
    receiverDid,
    senderDid,
    senderDid,
    didResolver,
    secretsResolver,
    { forward: false },
  );

  return encryptedMessage;
}

export async function handleContactRequest(
  encryptedMessage: string,
  didResolver: DIDResolver,
  secretsResolver: SecretsResolver,
): Promise<void> {
  const [unpackedMessage] = await Message.unpack(
    encryptedMessage,
    didResolver,
    secretsResolver,
    {},
  );

  const messageBody = unpackedMessage.as_value().body;

  if (messageBody.type === validEncodedUrl) {
    console.log(`Received contact request from ${messageBody.from}`);
  } else if (messageBody.type === MessageType.RoutingForward) {
    console.log(`Received routing forward from ${messageBody.from}`);
  }
}

function createDidResolver(knownDids: DIDDoc[]): MessagingServiceDIDResolver {
  return new MessagingServiceDIDResolver(knownDids);
}

function createSecretsResolver(
  knownSecrets: Secret[],
): MessagingServiceSecretsResolver {
  return new MessagingServiceSecretsResolver(knownSecrets);
}

export {
  MessagingServiceDIDResolver,
  MessagingServiceSecretsResolver,
  createDidResolver,
  createSecretsResolver,
};
