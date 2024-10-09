export function base64UrlEncode(data: Uint8Array): string {
    return Buffer.from(data)
      .toString('base64') // Convert to base64
      .replace(/\+/g, '-') // Replace '+' with '-'
      .replace(/\//g, '_') // Replace '/' with '_'
      .replace(/=+$/, ''); // Remove trailing '='
  }
  