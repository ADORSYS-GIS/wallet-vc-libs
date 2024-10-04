declare module 'qrcode';
declare module 'canvas';
declare module 'jsqr' {
  interface QRCode {
    version: number;
    errorCorrectionLevel: string;
    data: string;
  }

  function jsqr(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
      inversionAttempts?: 'dontInvert' | 'attemptBoth' | 'onlyInvert';
    },
  ): QRCode | null;

  export default jsqr;
}
