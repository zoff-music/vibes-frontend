import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import logoUrl from '../../assets/icon.png';

interface QrCodeProps {
  value: string;
}

export function QrCode({ value }: QrCodeProps) {
  const [source, setSource] = useState('');
  useEffect(() => {
    const loadQrCode = async () => {
      const dataUrl = await QRCode.toDataURL(value, {
        color: { dark: '#120b1e', light: '#ffffff' },
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 260,
      });
      setSource(dataUrl);
    };
    void loadQrCode();
  }, [value]);
  if (!source) return <div className="size-52 rounded-2xl bg-white" />;
  return (
    <div className="relative size-52 overflow-hidden rounded-2xl bg-white">
      <img alt="Scan to join this Zoff room" className="size-52" src={source} />
      <img
        alt=""
        className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-tv-background p-1"
        src={logoUrl}
      />
    </div>
  );
}
