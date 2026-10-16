import type { RemoteSessionV2 } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { safeWrap } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';
import type { ControllerRemoteSession } from '@/providers/app-provider';
import type { ControllerRemoteActionData } from '@/routes/remotes.controller.$id/action';

interface ControllerPairingOptions {
  onPaired: (remoteId: string, session: RemoteSessionV2) => Promise<void>;
  session: ControllerRemoteSession | null;
  setError: (message: string) => void;
}

export interface ControllerPairingState {
  controllerToken: string;
  pairingCode: string;
  pairing: boolean;
  scanDetected: boolean;
  remoteId: string;
  scannerVisible: boolean;
}

export interface ControllerPairingActions {
  clearCredentials: () => void;
  handleScan: (result: BarcodeScanningResult) => void;
  openScanner: () => Promise<void>;
  resetScan: () => void;
  pair: () => Promise<void>;
  pairWithToken: (remoteId: string, pairingToken: string) => Promise<void>;
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
  const [pairing, setPairing] = useState(false);
  const [scanDetected, setScanDetected] = useState(false);
  const pairingRef = useRef(false);
  const scanConsumedRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [, pairingFetcher] = useFetcher<ControllerRemoteActionData>({
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
      setScannerVisible(false);
      setError('');
      return true;
    },
    [onPaired, setError],
  );

  const pair = useCallback(async () => {
    if (pairingRef.current) return;

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
    pairingRef.current = true;
    setPairing(true);
    setError('');

    const result = await pairingFetcher.submit(
      { intent: 'pair', pairingCode: normalizedPairingCode },
      { params: { id: normalizedRemoteId } },
    );
    if (!(await applyPairing(normalizedRemoteId, result.data))) {
      setError(result.error || 'Could not pair this remote.');
    }

    pairingRef.current = false;
    setPairing(false);
  }, [applyPairing, pairingCode, pairingFetcher.submit, remoteId, setError]);

  const resetScan = useCallback(() => {
    if (pairingRef.current) return;

    scanConsumedRef.current = false;
    setScanDetected(false);
    setError('');
  }, [setError]);

  const openScanner = useCallback(async () => {
    if (pairingRef.current) return;

    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) {
        setError('Camera access is required to scan a remote QR code.');
        return;
      }
    }
    resetScan();
    setScannerVisible(true);
  }, [permission?.granted, requestPermission, resetScan, setError]);

  const pairWithToken = useCallback(
    async (nextRemoteId: string, pairingToken: string) => {
      if (pairingRef.current) return;

      pairingRef.current = true;
      setPairing(true);
      setError('');
      setRemoteId(nextRemoteId);

      const result = await pairingFetcher.submit(
        { intent: 'pair', pairingToken },
        { params: { id: nextRemoteId } },
      );
      if (!(await applyPairing(nextRemoteId, result.data))) {
        setError(result.error || 'Could not pair this remote.');
      }

      pairingRef.current = false;
      setPairing(false);
    },
    [applyPairing, pairingFetcher.submit, setError],
  );

  const handleScan = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (scanConsumedRef.current || pairingRef.current) return;

      scanConsumedRef.current = true;
      setScanDetected(true);
      void triggerSelectionFeedback();

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
      void pairWithToken(scannedRemoteId, pairingToken);
    },
    [pairWithToken, setError],
  );

  const clearCredentials = useCallback(() => {
    setRemoteId('');
    setControllerToken('');
    setPairingCode('');
    setScannerVisible(false);
  }, []);

  return [
    {
      controllerToken,
      pairingCode,
      pairing,
      scanDetected,
      remoteId,
      scannerVisible,
    },
    {
      clearCredentials,
      handleScan,
      openScanner,
      resetScan,
      pair,
      pairWithToken,
      setPairingCode,
      setRemoteId,
      setScannerVisible,
    },
  ];
}
