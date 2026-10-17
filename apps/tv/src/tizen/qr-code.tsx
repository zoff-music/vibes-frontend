import { useEffect, useState } from 'preact/compat';
import QRCode from 'qrcode';
import logoUrl from '../../assets/icon.png';

interface QrCodeProps {
  value: string;
}

export function QrCode({ value }: QrCodeProps) {
  const [source, setSource] = useState('');
  useEffect(() => {
    const loadQrCode = async () => {
      const dataUrl = await QRCode.toDataURL(value, {
        color: { dark: '#ffffff', light: '#000000' },
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 176,
      });
      setSource(dataUrl);
    };
    void loadQrCode();
  }, [value]);

  if (!source) return <div className="size-44 rounded-2xl bg-black" />;

  return (
    <div className="relative size-44 overflow-hidden rounded-2xl bg-black">
      <img alt="Scan to join this Zoff room" className="size-44" src={source} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img alt="" className="size-8 rounded-lg bg-black p-1" src={logoUrl} />
      </div>
    </div>
  );
}
