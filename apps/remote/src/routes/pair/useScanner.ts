import { safeWrap, safeWrapAsync } from '@vibes/shared';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export function useScanner() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    if (!scanning) return;

    let active = true;
    let stream: MediaStream | null = null;
    let timer = 0;
    setScanError('');

    const scan = async () => {
      const { default: decode } = await import('jsqr');
      if (!active) return;

      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (!active || !videoRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      if (!active) return;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Camera image processing is unavailable');

      const inspectFrame = () => {
        if (!active) return;

        if (
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth
        ) {
          canvas.width = Math.min(video.videoWidth, 640);
          canvas.height = Math.round(
            (video.videoHeight * canvas.width) / video.videoWidth,
          );
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          const result = decode(pixels.data, pixels.width, pixels.height);

          if (result?.data) {
            const [error, url] = safeWrap(() => new URL(result.data));
            if (
              !error &&
              url &&
              url.origin === window.location.origin &&
              (url.pathname === '/remotes' ||
                url.pathname === '/remotes/join') &&
              url.searchParams.get('remoteId') &&
              url.searchParams.get('pair')
            ) {
              setScanning(false);
              navigate(`/remotes/join${url.search}`);
              return;
            }

            setScanError(
              'QR code found, but it is not a Zoff remote pairing code.',
            );
          }
        }

        timer = window.setTimeout(inspectFrame, 200);
      };

      inspectFrame();
    };

    void safeWrapAsync(scan()).then(([error]) => {
      if (!error || !active) return;

      setScanError(
        'Could not open the camera. Allow camera access in your browser and try again.',
      );
      setScanning(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [navigate, scanning]);

  return { videoRef, scanning, scanError, setScanning };
}
