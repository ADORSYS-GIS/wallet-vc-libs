import { Message, SecretsResolver, Secret } from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { PeerDIDResolver } from 'did-resolver-lib';

class DidcommSecretsResolver implements SecretsResolver {
  private knownSecrets: Secret[];

  constructor(knownSecrets: Secret[]) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId: string): Promise<Secret | null> {
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds: string[]): Promise<string[]> {
    return secretIds.filter((id) =>
      this.knownSecrets.some((secret) => secret.id === id),
    );
  }
}

function createSecretsResolver(knownSecrets: Secret[]): DidcommSecretsResolver {
  return new DidcommSecretsResolver(knownSecrets);
}

export interface PrivateKeyJWK {
  id: string;
  type: string;
  privateKeyJwk: {
    crv: string;
    d: string;
    kty: string;
    x: string;
    y?: string;
  };
}

function prependDidToSecretIds(
  secrets: PrivateKeyJWK[],
  did: string,
): PrivateKeyJWK[] {
  return secrets.map((secret) => ({
    ...secret,
    id: `${did}${secret.id.replace(did, '')}`,
  }));
}

export async function processMediatorOOB(oob: string) {
  try {
    const oobParts = oob.split('=');
    if (oobParts.length < 2) {
      throw new Error('Invalid OOB format. Missing encoded payload.');
    }

    const oobUrl = oobParts[1];
    const decodedOob = JSON.parse(
      Buffer.from(oobUrl, 'base64url').toString('utf-8'),
    );

    if (!decodedOob.from) {
      throw new Error('Invalid OOB content. Missing "from" field.');
    }

    const didTo = decodedOob.from;

    const didPeerMethod = new DidPeerMethod();
    const didPeer = await didPeerMethod.generateMethod2();

    const mediationRequest = new Message({
      extra_header: [{ return_route: 'all' }],
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.MediationRequest,
      body: {},
    });

    const secrets: PrivateKeyJWK[] = [didPeer.privateKeyE, didPeer.privateKeyV];
    const updatedSecrets = prependDidToSecretIds(secrets, didPeer.did);
    const secretsResolver = createSecretsResolver(updatedSecrets);

    const hardcodedValue =
      'SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9kaWRjb21tIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXSwicm91dGluZ0tleXMiOlsiZGlkOmV4YW1wbGU6MTIzNDU2Nzg5YWJjZGVmZ2hpI2tleS0xIl19fQ';
    const updatedDidTo = didTo
      .split('.')
      .slice(0, -1)
      .concat(hardcodedValue)
      .join('.');

    const resolver = new PeerDIDResolver();

    await mediationRequest.pack_encrypted(
      updatedDidTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const keylistUpdate = new Message({
      id: uuidv4(),
      typ: MessageTyp.Didcomm,
      type: MessageType.KeylistUpdate,
      body: {
        updates: [
          {
            action: 'add',
            recipient_did: didPeer.did,
          },
        ],
      },
    });

    await keylistUpdate.pack_encrypted(
      updatedDidTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    // Send mediation request (commented out to prevent execution)
    // const mediationResponse = await axios.post(oobUrl, packedMediationRequest, {
    //   headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    // });
    // const mediatorResponse = await Message.unpack(
    //   mediationResponse.data,
    //   resolver,
    //   secretsResolver,
    //   {},
    // );

    // Send Keylist Update (commented out to prevent execution)
    // const keylistResponse = await axios.post(oobUrl, packedKeylistUpdate, {
    //   headers: { 'Content-Type': 'application/didcomm-encrypted+json' },
    // });
    // const unpackedKeylistResponse = await Message.unpack(
    //   keylistResponse.data,
    //   resolver,
    //   secretsResolver,
    //   {},
    // );

    // return unpackedKeylistResponse;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error processing OOB: ${error.message}`);
    } else {
      throw new Error('Unknown error during OOB processing');
    }
  }
}
