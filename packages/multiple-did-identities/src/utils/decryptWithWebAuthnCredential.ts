// export async function decryptWithWebAuthnCredential(encryptedData: ArrayBuffer, iv: Uint8Array) {

//     // Authenticate user via WebAuthn
//     const credential = await navigator.credentials.get({
//         publicKey: {
//             challenge: crypto.getRandomValues(new Uint8Array(32)), // Challenge to verify the response
//             timeout: 60000,
//             userVerification: "required",
//         },
//     });

//     if (!credential) {
//         throw new Error("WebAuthn authentication failed.");
//     }

//     // Get the private key securely stored in hardware
//     const privateKey = credential.response;

//     // Decrypt the data using the private key
//     const decryptedData = await crypto.subtle.decrypt(
//         {
//             name: "RSA-OAEP",
//         },
//         privateKey,
//         encryptedData
//     );

//     // Convert the decrypted data back to a string and parse it
//     const decoder = new TextDecoder();
//     const decryptedPrivateKey = JSON.parse(decoder.decode(decryptedData));

//     return decryptedPrivateKey; // Return the decrypted private key
// }
