# qr-scanner

This library provides a React-based component that allows you to scan QR codes using a device's camera. It utilizes the jsQR library to process QR code data in real-time from a video stream.

## Usage

Below is an example of how to use the QrScanner component in your application.

```ts
import { QrScanner } from '@adorsys-gis/qr-scanner';

const App = () => {
  // Handle successful scan result
  const handleResult = (data, code) => {
    console.log('QR code data:', data);
  };

  // Handle scanning error
  const handleError = (error) => {
    console.error(error);
  };

  return <QrScanner onResult={handleResult} onError={handleError} facingMode="environment" scanDelay={500} />;
};
```

## Props

- `onResult`: a callback function that is called when a QR code is successfully scanned
- `onError`: a callback function that is called when an error occurs during the scanning process
- `facingMode`: specifies the camera to use for scanning (either "environment" or "user")
- `scanDelay`: the delay between each scan in milliseconds

## Error Handling

The QrScanner library provides error handling and display of error messages. If an error occurs during scanning, the onError callback function is called and the error message is displayed on the screen. Some common errors that can occur during scanning include:

Camera permission errors
QR code decoding errors
Network errors
