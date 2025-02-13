import type { QRCode } from 'jsqr';

export interface IQrScannerProps<T = unknown> {
  /**
   * This event gets fired when a qr-code is scanned
   * @param result The result of the qr-code (parsed)
   * @param rawResult The result of the qr-code
   */
  onResult: (data: string | T, code: QRCode) => void;
  /** This event gets fired when an exception occurs.
   *
   * The returned value will modify the display error message.
   * If no string is returned the default exception message is displayed.
   * */
  onError?: (error: Error) => string | void;
  /** Validate the qr codes data */
  validate?: (data: unknown) => T;
  /**
   * The time between looking for a qr code (in milliseconds) in the video stream
   * @default 500
   */
  scanDelay?: number;
  /**
   * Which camera mode should the scanner face
   * @default "environment"
   */
  facingMode?: 'environment' | 'user';
  /**
   * The UI of the scanner, permits user to style the display of their video stream.
   * @param videoElement The video element that displays the video stream
   * @example
   * ```tsx
   * import { QrScanner } from "@datev/qr-scanner";
   *
   * const App = () => (
   *   <div style={{ width: "50vw" }}>
   *     <QrCodeScanner
   *       onResult={(result) => {
   *         console.log(result);
   *       }}
   *     >
   *       {(videoElement) => (
   *         <div
   *           style={{
   *             borderColor: "rgb(147 197 253)",
   *             borderWidth: "4px",
   *             width: "100%",
   *           }}
   *         >
   *           <video
   *             ref={videoElement}
   *             style={{ width: "100%", height: "100%" }}
   *           />
   *         </div>
   *       )}
   *     </QrCodeScanner>
   *   </div>
   * );
   * ```
   */
  children?: (
    videoElement: React.RefObject<HTMLVideoElement>,
  ) => React.ReactNode;
}
