import type {
  DIDDoc,
  DIDResolver,
  Secret,
  SecretsResolver,
} from 'didcomm-node';
import { Message } from 'didcomm-node';
import {
  ALICE_DID,
  ALICE_DID_DOC,
  ALICE_SECRETS,
  BOB_DID,
  BOB_DID_DOC,
  BOB_SECRETS,
} from './fixtures/PackAndUnpackFixtures';

const MESSAGE_ID = '1234567890';
const MESSAGE_TYP = 'application/didcomm-plain+json';
const MESSAGE_TYPE = 'http://example.com/protocols/lets_do_lunch/1.0/proposal';
const ALICE_KID = ALICE_DID + '#key-x25519-1';
const MESSAGE_BODY = { messagespecificattribute: 'and its value' };

class ExampleDIDResolver implements DIDResolver {
  knownDids: DIDDoc[];

  constructor(knownDids: DIDDoc[]) {
    this.knownDids = knownDids;
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.knownDids.find((ddoc) => ddoc.id === did) || null;
  }
}

class ExampleSecretsResolver implements SecretsResolver {
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

function createDidResolver(knownDids: DIDDoc[]): ExampleDIDResolver {
  return new ExampleDIDResolver(knownDids);
}

function createSecretsResolver(knownSecrets: Secret[]): ExampleSecretsResolver {
  return new ExampleSecretsResolver(knownSecrets);
}

describe('DIDComm message pack and unpack', () => {
  let didResolver: ExampleDIDResolver;
  let secretsResolver: ExampleSecretsResolver;

  beforeEach(() => {
    didResolver = createDidResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = createSecretsResolver(ALICE_SECRETS);
  });

  it('should pack, encrypt, and then unpack a message successfully', async () => {
    const msg = new Message({
      id: MESSAGE_ID,
      typ: MESSAGE_TYP,
      type: MESSAGE_TYPE,
      from: ALICE_DID,
      to: [BOB_DID],
      created_time: 1516269022,
      expires_time: 1516385931,
      body: MESSAGE_BODY,
    });

    // Pack and encrypt the message
    const [encryptedMsg, encryptMetadata] = await msg.pack_encrypted(
      BOB_DID,
      ALICE_DID,
      ALICE_DID,
      didResolver,
      secretsResolver,
      {
        forward: false,
      },
    );

    expect(encryptedMsg).toBeDefined();
    expect(encryptMetadata).toMatchObject({
      from_kid: ALICE_KID,
      to_kids: expect.any(Array),
    });

    // Reinitialize resolvers for the receiving party
    didResolver = createDidResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = createSecretsResolver(BOB_SECRETS);

    // Unpack and decrypt the message
    const [unpackedMsg, unpackMetadata] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    const unpackedContent = unpackedMsg.as_value();
    expect(unpackedContent).toMatchObject({
      id: MESSAGE_ID,
      typ: MESSAGE_TYP,
      type: MESSAGE_TYPE,
      body: MESSAGE_BODY,
    });

    expect(unpackMetadata).toMatchObject({
      sign_from: expect.any(String),
      encrypted_from_kid: ALICE_KID,
      encrypted_to_kids: expect.any(Array),
    });
  });

  it('should unpack an encrypted message successfully', async () => {
    const msg = new Message({
      id: MESSAGE_ID,
      typ: MESSAGE_TYP,
      type: MESSAGE_TYPE,
      from: ALICE_DID,
      to: [BOB_DID],
      created_time: 1516269022,
      expires_time: 1516385931,
      body: MESSAGE_BODY,
    });

    // Pack the message to simulate sending it
    const [encryptedMsg] = await msg.pack_encrypted(
      BOB_DID,
      ALICE_DID,
      ALICE_DID,
      didResolver,
      secretsResolver,
      {
        forward: false,
      },
    );

    // Unpack the message to simulate receiving it
    didResolver = createDidResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = createSecretsResolver(BOB_SECRETS);

    const [unpackedMsg, unpackMetadata] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    expect(unpackedMsg).toBeDefined();
    expect(unpackedMsg.as_value()).toMatchObject({
      typ: MESSAGE_TYP,
      body: MESSAGE_BODY,
    });

    expect(unpackMetadata).toMatchObject({
      sign_from: expect.any(String),
      encrypted_from_kid: ALICE_KID,
      encrypted_to_kids: expect.any(Array),
    });
  });
});
