import {
  Message,
  DIDDoc,
  DIDResolver,
  Secret,
  SecretsResolver,
} from 'didcomm-node';

import {
  ALICE_DID,
  ALICE_DID_DOC,
  ALICE_SECRETS,
  BOB_DID,
  BOB_DID_DOC,
  BOB_SECRETS,
} from '../PackAndUnpackFixtures';

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

describe('DIDComm message pack and unpack', () => {
  let didResolver: ExampleDIDResolver;
  let secretsResolver: ExampleSecretsResolver;

  beforeEach(() => {
    didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = new ExampleSecretsResolver(ALICE_SECRETS);
  });

  it('should pack, encrypt, and then unpack a message successfully', async () => {
    const msg = new Message({
      id: '1234567890',
      typ: 'application/didcomm-plain+json',
      type: 'http://example.com/protocols/lets_do_lunch/1.0/proposal',
      from: ALICE_DID,
      to: [BOB_DID],
      created_time: 1516269022,
      expires_time: 1516385931,
      body: { messagespecificattribute: 'and its value' },
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
    expect(encryptMetadata).toHaveProperty('from_kid');
    expect(encryptMetadata).toHaveProperty(
      'from_kid',
      ALICE_DID + '#key-x25519-1',
    );
    expect(encryptMetadata).toHaveProperty('to_kids');

    // Reinitialize resolvers for the receiving party
    didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = new ExampleSecretsResolver(BOB_SECRETS);

    // Unpack and decrypt the message
    const [unpackedMsg, unpackMetadata] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    const unpackedContent = unpackedMsg.as_value(); // Use .as_value() to get the actual content
    expect(unpackedContent).toHaveProperty('id', '1234567890');
    expect(unpackedContent).toHaveProperty(
      'typ',
      'application/didcomm-plain+json',
    );
    expect(unpackedContent).toHaveProperty(
      'type',
      'http://example.com/protocols/lets_do_lunch/1.0/proposal',
    );
    expect(unpackedContent.body).toHaveProperty(
      'messagespecificattribute',
      'and its value',
    );

    expect(unpackMetadata).toHaveProperty('sign_from'); // Ensure metadata shows encryption
    expect(unpackMetadata).toHaveProperty(
      'encrypted_from_kid',
      ALICE_DID + '#key-x25519-1',
    ); // Confirm correct sender's key
    expect(unpackMetadata).toHaveProperty('encrypted_to_kids'); // Ensure recipient's key ID exists
  });

  it('should unpack an encrypted message successfully', async () => {
    const msg = new Message({
      id: '1234567890',
      typ: 'application/didcomm-plain+json',
      type: 'http://example.com/protocols/lets_do_lunch/1.0/proposal',
      from: ALICE_DID,
      to: [BOB_DID],
      created_time: 1516269022,
      expires_time: 1516385931,
      body: { messagespecificattribute: 'and its value' },
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
    didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = new ExampleSecretsResolver(BOB_SECRETS);

    const [unpackedMsg, unpackMetadata] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    expect(unpackedMsg).toBeDefined();
    expect(unpackedMsg.as_value()).toHaveProperty(
      'body.messagespecificattribute',
      'and its value',
    );
    expect(unpackedMsg.as_value()).toHaveProperty(
      'typ',
      'application/didcomm-plain+json',
    );

    expect(unpackMetadata).toHaveProperty('sign_from');
    expect(unpackMetadata).toHaveProperty(
      'encrypted_from_kid',
      ALICE_DID + '#key-x25519-1',
    ); // Confirm correct sender's key
    expect(unpackMetadata).toHaveProperty('encrypted_to_kids'); // Ensure recipient's key ID exists
  });
});
