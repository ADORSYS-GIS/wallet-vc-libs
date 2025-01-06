export async function createWebAuthnCredential(id: string) {
    const publicKeyCredential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)), // Random challenge
        rp: { name: "wallet-react" },
        user: {
          id: Uint8Array.from(id, (c) => c.charCodeAt(0)),
          displayName: id,
          name: id,
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ECDSA with SHA-256
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Use platform hardware
          requireResidentKey: true,
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct",
      },
    });
  
    return publicKeyCredential;
  }
  