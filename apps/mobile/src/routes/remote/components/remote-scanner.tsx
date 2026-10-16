import { classNames } from '@vibes/shared';
import { CameraView } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <View className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
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

                <View
                  className={classNames(
                    'self-center overflow-hidden rounded-3xl border-4 bg-black',
                    error ? 'border-error' : 'border-accent',
                  )}
                  style={{ width: previewSize, height: previewSize }}
                >
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
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

                <View className="w-full gap-5">
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
      </View>
    </Modal>
  );
}

const safeAreaStyle = { flex: 1 };
