import type { RemoteSession } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { safeWrap } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useState } from 'react';
import type { ControllerRemoteSession } from '@/providers/app-provider';
import type { ControllerRemoteActionData } from '@/routes/remotes.controller.$id/action';

interface ControllerPairingOptions {
  onPaired: (remoteId: string, session: RemoteSession) => Promise<void>;
  session: ControllerRemoteSession | null;
  setError: (message: string) => void;
}

export interface ControllerPairingState {
  controllerToken: string;
  pairingCode: string;
  remoteId: string;
  scannerVisible: boolean;
}

export interface ControllerPairingActions {
  clearCredentials: () => void;
  handleScan: (result: BarcodeScanningResult) => void;
  openScanner: () => Promise<void>;
  pair: () => Promise<void>;
  setPairingCode: (code: string) => void;
  setRemoteId: (remoteId: string) => void;
  setScannerVisible: (visible: boolean) => void;
}

export function useControllerPairing({
  onPaired,
  session,
  setError,
}: ControllerPairingOptions): readonly [
  ControllerPairingState,
  ControllerPairingActions,
] {
  const [remoteId, setRemoteId] = useState(session?.id ?? '');
  const [controllerToken, setControllerToken] = useState(
    session?.controllerToken ?? '',
  );
  const [pairingCode, setPairingCode] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const pairingFetcher = useFetcher<ControllerRemoteActionData>({
    routeId: 'remotes.controller.$id',
  });

  useEffect(() => {
    if (!session) return;
    setRemoteId(session.id);
    setControllerToken(session.controllerToken);
  }, [session]);

  const applyPairing = useCallback(
    async (nextRemoteId: string, result: ControllerRemoteActionData | null) => {
      if (result?.intent !== 'paired') return false;
      setRemoteId(nextRemoteId);
      setControllerToken(result.session.controllerToken);
      await onPaired(nextRemoteId, result.session);
      setError('');
      return true;
    },
    [onPaired, setError],
  );

  const pair = useCallback(async () => {
    const normalizedRemoteId = remoteId.trim();
    const normalizedPairingCode = pairingCode.trim();
    if (!normalizedRemoteId) {
      setError('Enter the remote ID.');
      return;
    }
    if (!normalizedPairingCode) {
      setError('Enter the pairing code.');
      return;
    }
    const result = await pairingFetcher.submit(
      { intent: 'pair', pairingCode: normalizedPairingCode },
      { params: { id: normalizedRemoteId } },
    );
    if (!(await applyPairing(normalizedRemoteId, result.data))) {
      setError(result.error || 'Could not pair this remote.');
    }
  }, [applyPairing, pairingCode, pairingFetcher.submit, remoteId, setError]);

  const openScanner = useCallback(async () => {
    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) {
        setError('Camera access is required to scan a remote QR code.');
        return;
      }
    }
    setScannerVisible(true);
  }, [permission?.granted, requestPermission, setError]);

  const handleScan = useCallback(
    ({ data }: BarcodeScanningResult) => {
      const [urlError, url] = safeWrap(() => new URL(data));
      if (urlError || !url) {
        setError('That QR code is not a valid Zoff remote pairing code.');
        return;
      }
      const scannedRemoteId = url.searchParams.get('remoteId') ?? '';
      const pairingToken = url.searchParams.get('pair') ?? '';
      if (!scannedRemoteId || !pairingToken) {
        setError('That QR code is missing its remote pairing details.');
        return;
      }
      setRemoteId(scannedRemoteId);
      setScannerVisible(false);
      const submitPairing = async () => {
        const result = await pairingFetcher.submit(
          { intent: 'pair', pairingToken },
          { params: { id: scannedRemoteId } },
        );
        if (!(await applyPairing(scannedRemoteId, result.data))) {
          setError(result.error || 'Could not pair this remote.');
        }
      };
      void submitPairing();
    },
    [applyPairing, pairingFetcher.submit, setError],
  );

  const clearCredentials = useCallback(() => {
    setRemoteId('');
    setControllerToken('');
    setPairingCode('');
    setScannerVisible(false);
  }, []);

  return [
    { controllerToken, pairingCode, remoteId, scannerVisible },
    {
      clearCredentials,
      handleScan,
      openScanner,
      pair,
      setPairingCode,
      setRemoteId,
      setScannerVisible,
    },
  ];
}
