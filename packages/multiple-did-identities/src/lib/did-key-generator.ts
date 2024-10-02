import * as ed from 'noble-ed25519';
import { encode as encodeBase58 } from 'multibase';

// Function to generate DID:key
export async function generateDidKey() {
  // Generate a key pair (public and private keys)
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);

  // Encode the public key as base58 with the multibase prefix
  const publicKeyBase58 = encodeBase58('z', publicKey); // 'z' is the base58 code

  // Create the DID:key identifier based on the public key
  const did = `did:key:${publicKeyBase58}`;

  return {
    did,
    privateKey: privateKey,
    publicKey: publicKey,
  };
}
