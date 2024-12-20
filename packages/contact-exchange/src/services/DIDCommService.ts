import { Message, SecretsResolver, Secret } from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './DIDCommOOBInvitation';
import { DidPeerMethod } from '@adorsys-gis/multiple-did-identities/src/did-methods/DidPeerMethod';
import { PeerDIDResolver } from 'did-resolver-lib';
import axios from 'axios';

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
    const secretsResolver = new DidcommSecretsResolver(updatedSecrets);

    const hardcodedValue =
      'SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9kaWRjb21tIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXSwicm91dGluZ0tleXMiOlsiZGlkOmV4YW1wbGU6MTIzNDU2Nzg5YWJjZGVmZ2hpI2tleS0xIl19fQ';
    const updatedDidTo = didTo
      .split('.')
      .slice(0, -1)
      .concat(hardcodedValue)
      .join('.');

    const resolver = new PeerDIDResolver();

    const packedMediationRequest = await mediationRequest.pack_encrypted(
      updatedDidTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const mediatorEndpoint = decodedOob.serviceEndpoint;
    if (!mediatorEndpoint) {
      throw new Error('Mediator endpoint is missing from the OOB invitation.');
    }

    const response = await axios.post(
      mediatorEndpoint,
      packedMediationRequest,
      {
        params: {
          message: packedMediationRequest.toString(),
        },
        headers: {
          'Content-Type': 'application/didcomm-encrypted+json',
        },
      },
    );

    if (response.status !== 200) {
      throw new Error('Mediation request failed.');
    }

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

    const packedKeylistUpdate = await keylistUpdate.pack_encrypted(
      updatedDidTo,
      didPeer.did,
      didPeer.did,
      resolver,
      secretsResolver,
      { forward: false },
    );

    const keylistUpdateResponse = await axios.post(
      mediatorEndpoint,
      packedKeylistUpdate,
      {
        params: {
          message: packedKeylistUpdate.toString(),
        },
        headers: {
          'Content-Type': 'application/didcomm-encrypted+json',
        },
      },
    );

    if (keylistUpdateResponse.status !== 200) {
      throw new Error('Keylist update request failed.');
    }

    // const unpackedKeylistUpdate = await keylistUpdate.unpack(
    //   keylistUpdateResponse.data,
    //   didPeer.did,
    //   resolver,
    //   secretsResolver,
    // );
    // console.log('Unpacked Keylist Update:', unpackedKeylistUpdate);

    return keylistUpdateResponse.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error processing OOB: ${error.message}`);
    } else {
      throw new Error('Unknown error during OOB processing');
    }
  }
}
