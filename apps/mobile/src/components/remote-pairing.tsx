import { CameraView } from 'expo-camera';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { ControllerRemote } from '@/hooks/use-controller-remote';

interface RemotePairingProps {
  controller: ControllerRemote;
}

export function RemotePairing({ controller }: RemotePairingProps) {
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
                  onPress={() => void controller.openScanner()}
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
                  onChangeText={controller.setRemoteId}
                  placeholder="Remote ID"
                  testID="remote-id"
                />
                <Field
                  accessibilityLabel="Pairing code"
                  autoCapitalize="none"
                  value={controller.pairingCode}
                  onChangeText={controller.setPairingCode}
                  onSubmitEditing={() => void controller.pair()}
                  placeholder="Pairing code"
                  testID="remote-pairing-code"
                />
                <Button
                  label="Pair remote"
                  onPress={() => void controller.pair()}
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
          <View style={styles.scanner}>
            <CameraView
              active={controller.scannerVisible}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              facing="back"
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={controller.handleScan}
            />
            <SafeAreaView style={styles.scannerOverlay}>
              <View className="items-center gap-3 px-6 pt-8">
                <Heading>Scan remote QR code</Heading>
                <Copy muted>Point the camera at the pairing code.</Copy>
              </View>
              <View style={styles.scanFrame} />
              <View className="px-4 pb-4">
                <Button
                  label="Close scanner"
                  tone="secondary"
                  onPress={() => controller.setScannerVisible(false)}
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

const styles = StyleSheet.create({
  scanner: { backgroundColor: '#08050f', flex: 1 },
  scannerOverlay: { flex: 1, justifyContent: 'space-between' },
  scanFrame: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderColor: '#00b4d4',
    borderRadius: 28,
    borderWidth: 3,
    height: 260,
    width: 260,
  },
});
