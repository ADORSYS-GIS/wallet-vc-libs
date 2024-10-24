import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loading } from './Loading';
import { IQrScannerProps } from './qrScannerProps';

export function QrScanner<T = unknown>(props: IQrScannerProps<T>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const captureFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      if (
        video.readyState < 4 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        console.log('Video not ready yet');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        console.log('Canvas not ready yet');
        return;
      }

      try {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        if (imageData.data.length === 0) {
          console.log('Image data not ready yet');
          return;
        }
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          try {
            console.log('QR code data:', code.data);
            const data = decodeURIComponent(code.data);
            props.onResult(data, code);
          } catch (error: unknown) {
            setError('Failed to parse QR data');
            console.error(error);
          }
        } /*else {
          setError('QR code not found');
        }*/
      } catch (error: unknown) {
        setError('Error decoding QR code');
        console.error(error);
      }
    }
  }, [props]);

  useEffect(() => {
    const startVideo = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: props.facingMode || 'environment' },
          });
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // For iOS

          // Add event listener for canplay event
          if (videoRef.current) {
            videoRef.current.addEventListener('canplay', () => {
              if (videoRef.current) {
                videoRef.current.play();
              }
            });
          }

          setIsScanning(true);
          setIsLoading(false);
        } catch (err) {
          setError('Camera inaccessible');
          props.onError && props.onError(err as Error);
        }
      }
    };

    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [props]);

  useEffect(() => {
    if (!isScanning) {
      console.warn('isScanning must be true');
      return;
    }

    const scanInterval = setInterval(captureFrame, props.scanDelay ?? 500);

    return () => clearInterval(scanInterval);
  }, [captureFrame, isScanning, props.scanDelay]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  if (props.children) return <>{props.children(videoRef)}</>;

  return (
    <div
      style={{
        borderColor: 'rgb(147 197 253)',
        borderWidth: '4px',
        width: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <div
        style={{
          color: error ? 'red' : 'inherit',
          textAlign: 'center',
          fontWeight: 500,
          width: '100%',
        }}
      >
        {isLoading ? (
          <Loading message="Initializing camera..." />
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <Loading message="🌀 Searching for QR code" />
        )}
      </div>
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}