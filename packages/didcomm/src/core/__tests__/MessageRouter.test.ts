import { DIDDoc, DIDResolver, Secret, SecretsResolver } from 'didcomm-node';
import { createRoutedMessage } from './../MessageRouter';

import {
  ALICE_DID,
  ALICE_DID_DOC,
  ALICE_SECRETS,
  BOB_DID,
  BOB_DID_DOC,
} from './fixtures/PackAndUnpackFixtures';
import { MessageTyp, MessageType } from '../Messages.types';

// Mock DIDs and Secrets (you can replace these with actual test data)
const MESSAGE_BODY = { attribute: 'value' };

// Mock DID and Secret resolvers
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

describe('MessageRouter', () => {
  let didResolver: ExampleDIDResolver;
  let secretsResolver: ExampleSecretsResolver;

  beforeEach(() => {
    didResolver = createDidResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = createSecretsResolver(ALICE_SECRETS);
  });

  it('should pack a routing message successfully', async () => {
    const routedMessagePacked = await createRoutedMessage(
      ALICE_DID,
      BOB_DID,
      MessageType.RoutingForward,
      MessageTyp.Didcomm,
      MESSAGE_BODY,
      secretsResolver,
      didResolver,
      Math.round(new Date().getTime() / 1000),
    );

    expect(routedMessagePacked).toBeDefined();
    expect(typeof routedMessagePacked).toBe('string');
    // Parse the JSON string
    const jsonObject = JSON.parse(routedMessagePacked);

    expect(jsonObject).toHaveProperty('protected');

    expect(Array.isArray(jsonObject.recipients)).toBe(true);
    expect(jsonObject.recipients.length).toBeGreaterThan(0);

    expect(jsonObject).toHaveProperty('iv');
    expect(typeof jsonObject.iv).toBe('string');

    expect(jsonObject).toHaveProperty('ciphertext');
    expect(typeof jsonObject.ciphertext).toBe('string');

    expect(jsonObject).toHaveProperty('tag');
    expect(typeof jsonObject.tag).toBe('string');
  });
});
