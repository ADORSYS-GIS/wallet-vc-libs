import { DIDDoc, DIDResolver, Secret, SecretsResolver } from 'didcomm';

export class ExampleDIDResolver implements DIDResolver {
  diddoc: DIDDoc[];

  constructor(diddoc: DIDDoc[]) {
    this.diddoc = diddoc;
  }

  async resolve(did: string): Promise<DIDDoc | null> {
    return this.diddoc.find((ddoc) => ddoc.id === did) || null;
  }
}

export class ExampleSecretsResolver implements SecretsResolver {
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
