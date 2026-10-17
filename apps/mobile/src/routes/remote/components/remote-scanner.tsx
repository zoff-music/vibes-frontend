import { classNames } from '@vibes/shared';
import { CameraView } from 'expo-camera';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ContentColumn } from '@/components/native';
import type {
  ControllerRemoteActions,
  ControllerRemoteState,
} from '@/hooks/use-controller-remote';

interface RemoteScannerProps {
  controller: ControllerRemoteState;
  controllerActions: ControllerRemoteActions;
}

export function RemoteScanner({
  controller,
  controllerActions,
}: RemoteScannerProps) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [zoom, setZoom] = useState(0);
  const zoomRef = useRef(0);
  const pinchStartZoom = useRef(0);
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin(() => {
          pinchStartZoom.current = zoomRef.current;
        })
        .onUpdate((event) => {
          const nextZoom = Math.max(
            0,
            Math.min(1, pinchStartZoom.current + (event.scale - 1) * 0.15),
          );
          zoomRef.current = nextZoom;
          setZoom(nextZoom);
        }),
    [],
  );

  useEffect(() => {
    if (!controller.scannerVisible) return;

    setCameraReady(false);
    setCameraError('');
    zoomRef.current = 0;
    setZoom(0);
  }, [controller.scannerVisible]);
  const { width, height } = useWindowDimensions();
  const previewSize = Math.min(width - 48, height * 0.45, 384);
  const error = cameraError || controller.error;
  const close = () => {
    if (!controller.pairing) controllerActions.setScannerVisible(false);
  };
  let status = cameraReady ? 'Looking for a QR code…' : 'Starting camera…';

  if (controller.scanDetected) status = 'QR code found';

  if (controller.pairing) status = 'QR code found. Pairing…';

  if (error) status = error;

  return (
    <Modal
      visible={controller.scannerVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <GestureHandlerRootView className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
        <SafeAreaView style={safeAreaStyle}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center p-6"
            bounces={false}
          >
            <ContentColumn>
              <View className="items-center gap-8">
                <View className="items-center gap-3">
                  <Text
                    accessibilityRole="header"
                    className="text-center font-heading text-3xl text-mobile-text dark:text-mobile-dark-text"
                  >
                    Scan remote QR code
                  </Text>
                  <Text className="text-center font-body text-base text-mobile-muted dark:text-mobile-dark-muted">
                    Point your camera at the code on the other Zoff screen.
                  </Text>
                </View>

                <GestureDetector gesture={pinch}>
                  <View
                    className={classNames(
                      'self-center overflow-hidden rounded-3xl border-4 bg-black',
                      error ? 'border-error' : 'border-accent',
                    )}
                    style={{ width: previewSize, height: previewSize }}
                  >
                    {controller.scannerVisible && (
                      <CameraView
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        zoom={zoom}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        onCameraReady={() => setCameraReady(true)}
                        onMountError={() =>
                          setCameraError(
                            'The camera could not start. Close the scanner and try again, or enter the pairing code manually.',
                          )
                        }
                        {...(cameraReady &&
                          !controller.scanDetected &&
                          !controller.pairing &&
                          !error && {
                            onBarcodeScanned: controllerActions.handleScan,
                          })}
                      />
                    )}
                    {(!cameraReady || controller.pairing) && !error && (
                      <View
                        pointerEvents="none"
                        className="absolute inset-0 items-center justify-center gap-3 bg-black/40"
                      >
                        <ActivityIndicator color="#ffffff" size="large" />
                        <Text className="font-body text-lg text-white">
                          {controller.pairing ? 'Pairing…' : 'Starting camera…'}
                        </Text>
                      </View>
                    )}
                  </View>
                </GestureDetector>

                <View className="w-full gap-5">
                  <Text className="text-center font-body text-base text-mobile-muted dark:text-mobile-dark-muted">
                    Pinch to zoom
                  </Text>
                  <Text
                    accessibilityLiveRegion="polite"
                    accessibilityRole="text"
                    className="text-center font-body text-base text-mobile-text dark:text-mobile-dark-text"
                  >
                    {status}
                  </Text>
                  {!!error && !cameraError && !controller.pairing && (
                    <Button
                      label="Scan again"
                      onPress={controllerActions.resetScan}
                    />
                  )}
                  <Button
                    label="Close scanner"
                    tone="secondary"
                    disabled={controller.pairing}
                    onPress={close}
                  />
                </View>
              </View>
            </ContentColumn>
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const safeAreaStyle = { flex: 1 };
