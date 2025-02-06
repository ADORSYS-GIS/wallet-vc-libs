import type { JWK } from 'jose';

import { SecurityService } from '../security/SecurityService';

describe('Crypto Utilities', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    securityService = new SecurityService();
  });

  const pin = 9023846872;
  const sampleSecrets: JWK = {
    kty: 'oct',
    k: 'example-key',
  };

  it('should encrypt and decrypt data correctly', async () => {
    const { salt, ciphertext, iv } = await securityService.encrypt(
      pin,
      sampleSecrets,
    );
    const decryptedSecrets = await securityService.decrypt(
      pin,
      salt,
      iv,
      ciphertext,
    );

    expect(decryptedSecrets).toEqual(sampleSecrets);
  });

  it('should fail to decrypt with an incorrect pin', async () => {
    const { salt, ciphertext, iv } = await securityService.encrypt(
      pin,
      sampleSecrets,
    );
    const incorrectPin = 5678;

    await expect(
      securityService.decrypt(incorrectPin, salt, iv, ciphertext),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with an incorrect salt', async () => {
    const { ciphertext, iv } = await securityService.encrypt(
      pin,
      sampleSecrets,
    );
    const incorrectSalt = crypto.getRandomValues(new Uint8Array(16));

    await expect(
      securityService.decrypt(pin, incorrectSalt, iv, ciphertext),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with an incorrect IV', async () => {
    const { salt, ciphertext } = await securityService.encrypt(
      pin,
      sampleSecrets,
    );
    const incorrectIv = crypto.getRandomValues(new Uint8Array(12));

    await expect(
      securityService.decrypt(pin, salt, incorrectIv, ciphertext),
    ).rejects.toThrow();
  });
});
