import type { DIDKeyPairVariants } from '../did-methods/DidMethodFactory';

export function sanitizeDidDoc(didDoc: DIDKeyPairVariants): DIDKeyPairVariants {
  const sanitizedDidDoc = { ...didDoc };

  // Sanitize private keys based on encrypted keys present
  if ('encryptedPrivateKey' in sanitizedDidDoc) {
    delete sanitizedDidDoc.privateKey;
  }
  if (
    'encryptedPrivateKeyV' in sanitizedDidDoc &&
    'encryptedPrivateKeyE' in sanitizedDidDoc
  ) {
    delete sanitizedDidDoc.privateKeyV;
    delete sanitizedDidDoc.privateKeyE;
  }
  if (
    'encryptedPrivateKey1' in sanitizedDidDoc &&
    'encryptedPrivateKey2' in sanitizedDidDoc
  ) {
    delete sanitizedDidDoc.privateKey1;
    delete sanitizedDidDoc.privateKey2;
  }

  return sanitizedDidDoc;
}
