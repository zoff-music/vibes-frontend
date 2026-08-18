import { CameraView } from 'expo-camera';
import { Modal, ScrollView, Text, View } from 'react-native';
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
  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-5 p-4 pb-28"
          keyboardShouldPersistTaps="handled"
        >
          <ContentColumn>
            <View className="gap-5">
              <View className="items-center gap-2 px-6">
                <View className="mb-2 size-16 items-center justify-center rounded-3xl border border-accent/40 bg-accent/10">
                  <ZoffIcon color="#00b4d4" name="remote" size={30} />
                </View>
                <Heading>Pair a remote</Heading>
                <Text className="text-center font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                  Control another Zoff screen without becoming another listener.
                </Text>
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
                  <View className="h-px flex-1 bg-mobile-border dark:bg-mobile-dark-border" />
                  <Copy muted>OR ENTER A CODE</Copy>
                  <View className="h-px flex-1 bg-mobile-border dark:bg-mobile-dark-border" />
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
            <SafeAreaView className="flex-1 justify-between">
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
