import { useFetcher, useSearchParams } from '@kasperrt/smolter/preact';
import { plausibleClient } from '@vibes/api';
import { type ChangeEvent, useEffect, useRef, useState } from 'preact/compat';
import { type PairActionData } from '../clientAction';
import { useScanner } from './useScanner';

export function usePairRemote() {
  const fetcher = useFetcher<PairActionData>();
  const [searchParams] = useSearchParams();
  const autoPairFormRef = useRef<HTMLFormElement>(null);
  const submittedPairing = useRef('');
  const {
    videoRef,
    scanning,
    scanError,
    setScanning,
    zoom,
    changeZoom,
    startPinch,
    movePinch,
    endPinch,
  } = useScanner();
  const [remoteId, setRemoteId] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  const pairingToken = searchParams.get('pair') ?? '';
  const scannedRemoteId = searchParams.get('remoteId') ?? '';
  const hasPairingLink = Boolean(pairingToken && scannedRemoteId);
  const incompletePairingLink =
    Boolean(pairingToken || scannedRemoteId) && !hasPairingLink;
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    if (pairingToken) setScanning(false);
  }, [pairingToken, setScanning]);

  useEffect(() => {
    void plausibleClient.trackPageview({
      path: '/remotes',
      surface: 'remote',
    });
  }, []);

  useEffect(() => {
    const pairingKey = `${scannedRemoteId}:${pairingToken}`;

    if (
      submittedPairing.current === pairingKey ||
      !pairingToken ||
      !scannedRemoteId ||
      !autoPairFormRef.current
    ) {
      return;
    }

    submittedPairing.current = pairingKey;
    fetcher.submit(autoPairFormRef.current);
  }, [fetcher.submit, pairingToken, scannedRemoteId]);

  const handleRemoteIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRemoteId(event.currentTarget.value);
  };
  const handlePairingCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPairingCode(event.currentTarget.value.toUpperCase());
  };
  return {
    fetcher,
    autoPairFormRef,
    videoRef,
    scanning,
    scanError,
    setScanning,
    zoom,
    changeZoom,
    startPinch,
    movePinch,
    endPinch,
    remoteId,
    pairingCode,
    pairingToken,
    scannedRemoteId,
    hasPairingLink,
    incompletePairingLink,
    busy,
    handleRemoteIdChange,
    handlePairingCodeChange,
  };
}
