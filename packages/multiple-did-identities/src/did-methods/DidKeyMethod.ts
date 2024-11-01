import bs58 from 'bs58';
import { IDidMethod, DIDKeyPair } from './IDidMethod';
import { DIDMethodName } from './DidMethodFactory';
import { generateKeyPairs } from '../utils/generateKeyPairs';

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
    const publicKeyBase58 = bs58.encode([...ED25519_PUB_CODE, ...key.rawPublicKey]);

    // Construct the DID:key identifier
    const did = `did:key:z${publicKeyBase58}`;

    return {
      did,
      privateKey: key.privateKeyJwk,
      publicKey: key.publicKeyJwk,
    };
  }
}