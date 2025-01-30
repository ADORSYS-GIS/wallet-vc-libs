import { Secret, SecretsResolver } from 'didcomm';
import { jwkToPublicKeyBase58 } from '../didcomm';

/**
 * Extends base secret with an alternative ID for lookup.
 */
interface ExtendedSecret extends Secret {
  altId?: string;
}

/**
 * Implementation of a {@link SecretsResolver} for static secrets.
 */
export class StaticSecretsResolver implements SecretsResolver {
  knownSecrets: ExtendedSecret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets.map((secret) => {
      const base58 =
        secret.privateKeyBase58 ??
        secret.privateKeyMultibase?.replace(/^z/, '') ??
        jwkToPublicKeyBase58(secret.privateKeyJwk);

      const did = secret.id.split('#')[0] ?? '';
      return { altId: `${did}#${base58}`, ...secret };
    });
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return (
      this.knownSecrets.find(
        (secret) => secret.id === secretId || secret.altId === secretId,
      ) ?? null
    );
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((secretId) => this.get_secret(secretId));
  }
}
