import { classNames } from '@vibes/shared';
import { useNativePresentation } from '@vibes/ui/native';
import { CameraView } from 'expo-camera';
import { Modal, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  ContentColumn,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { Toast, ToastViewport } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import type {
  ControllerRemoteActions,
  ControllerRemoteState,
} from '@/hooks/use-controller-remote';

interface RemotePairingProps {
  controller: ControllerRemoteState;
  controllerActions: ControllerRemoteActions;
}

export function RemotePairing({
  controller,
  controllerActions,
}: RemotePairingProps) {
  const theme = useAppTheme();
  const terminal = useNativePresentation() === 'terminal';

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-5 p-4 pb-28"
          keyboardShouldPersistTaps="handled"
        >
          <ContentColumn>
            <View className="gap-5">
              <View className="items-center gap-2 px-6">
                <View
                  className={classNames(
                    'mb-2 size-16 items-center justify-center border',
                    !terminal && 'rounded-3xl border-accent/40 bg-accent/10',
                    terminal && 'border-[#55ffad] bg-[#03150d]',
                  )}
                >
                  <ZoffIcon color={theme.accent} name="remote" size={30} />
                </View>
                <Heading>Pair a remote</Heading>
                <Copy muted>
                  Control another Zoff screen without becoming another listener.
                </Copy>
              </View>
              <Card>
                <Copy muted>PAIR THIS PHONE</Copy>
                <Button
                  icon="scan"
                  label="Scan remote QR code"
                  tone="secondary"
                  onPress={() => void controllerActions.openScanner()}
                />
                <View className="flex-row items-center gap-3">
                  <View
                    className={classNames(
                      'h-px flex-1',
                      !terminal && 'bg-accent',
                      terminal && 'bg-[#55ffad]',
                    )}
                  />
                  <Copy muted>OR ENTER A CODE</Copy>
                  <View
                    className={classNames(
                      'h-px flex-1',
                      !terminal && 'bg-accent',
                      terminal && 'bg-[#55ffad]',
                    )}
                  />
                </View>
                <Field
                  accessibilityLabel="Remote ID"
                  autoCapitalize="none"
                  value={controller.remoteId}
                  onChangeText={controllerActions.setRemoteId}
                  placeholder="Remote ID"
                  testID="remote-id"
                />
                <Field
                  accessibilityLabel="Pairing code"
                  autoCapitalize="none"
                  value={controller.pairingCode}
                  onChangeText={controllerActions.setPairingCode}
                  onSubmitEditing={() => void controllerActions.pair()}
                  placeholder="Pairing code"
                  testID="remote-pairing-code"
                />
                <Button
                  label="Pair remote"
                  onPress={() => void controllerActions.pair()}
                />
                <Toast message={controller.error} />
              </Card>
            </View>
          </ContentColumn>
        </ScrollView>
        <Modal
          visible={controller.scannerVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View className="flex-1 bg-[#08050f]">
            <CameraView
              active={controller.scannerVisible}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              facing="back"
              className="absolute inset-0"
              onBarcodeScanned={controllerActions.handleScan}
            />
            <SafeAreaView className="justify-between" style={safeAreaStyle}>
              <View className="items-center gap-3 px-6 pt-8">
                <Heading>Scan remote QR code</Heading>
                <Copy muted>Point the camera at the pairing code.</Copy>
              </View>
              <View className="size-64 self-center rounded-3xl border-4 border-accent bg-transparent" />
              <View className="px-4 pb-4">
                <Button
                  label="Close scanner"
                  tone="secondary"
                  onPress={() => controllerActions.setScannerVisible(false)}
                />
              </View>
            </SafeAreaView>
            <ToastViewport />
          </View>
        </Modal>
      </SafeAreaView>
    </Screen>
  );
}

const safeAreaStyle = { flex: 1 };
