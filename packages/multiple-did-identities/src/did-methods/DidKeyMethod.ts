import { base58 } from '@scure/base';
import { generateKeyPairs } from '../utils/generateKeyPairs';
import { DIDMethodName } from './DidMethodFactory';
import { DIDKeyPair, IDidMethod } from './IDidMethod';

/**
 * DID:key Method Implementation
 * Generates a DID:key identifier using the Ed25519 public key.
 */
export class DidKeyMethod implements IDidMethod {
  method = DIDMethodName.Key;

  async generate(): Promise<DIDKeyPair> {
    const keyPair = await generateKeyPairs(1);
    const key = keyPair[0];

    // Define the Multicodec Prefix for Ed25519 Public Key
    const ED25519_PUB_CODE = new Uint8Array([0xed, 0x01]);

    // Encode the public key using bs58 directly
    const publicKeyBase58 = base58.encode(
      new Uint8Array([...ED25519_PUB_CODE, ...key.rawPublicKey]),
    );

    // Construct the DID:key identifier
    const did = `did:key:z${publicKeyBase58}`;

    return {
      did,
      privateKey: key.privateKeyJwk,
      publicKey: key.publicKeyJwk,
    };
  }
}
