import type { DIDKeyPairVariants } from '../did-methods/DidMethodFactory';
import type {
  DIDKeyPair,
  DIDKeyPairMethod1,
  DIDKeyPairMethod2,
  DIDKeyPairMethod4,
} from '../did-methods/IDidMethod';

// Type Guards
export function hasPrivateKey(
  didDocument: DIDKeyPairVariants,
): didDocument is DIDKeyPair & DIDKeyPairMethod1 {
  return 'privateKey' in didDocument;
}

export function hasPrivateKeyVandE(
  didDocument: DIDKeyPairVariants,
): didDocument is DIDKeyPairMethod2 {
  return 'privateKeyV' in didDocument && 'privateKeyE' in didDocument;
}

export function hasPrivateKey1and2(
  didDocument: DIDKeyPairVariants,
): didDocument is DIDKeyPairMethod4 {
  return 'privateKey1' in didDocument && 'privateKey2' in didDocument;
}
