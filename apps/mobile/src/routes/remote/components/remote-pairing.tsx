import { classNames } from '@vibes/shared';
import { ScrollView, View } from 'react-native';
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
import { Toast } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import type {
  ControllerRemoteActions,
  ControllerRemoteState,
} from '@/hooks/use-controller-remote';
import { RemoteScanner } from './remote-scanner';

interface RemotePairingProps {
  controller: ControllerRemoteState;
  controllerActions: ControllerRemoteActions;
}

export function RemotePairingV2({
  controller,
  controllerActions,
}: RemotePairingProps) {
  const theme = useAppTheme();

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
                    'rounded-3xl border-accent/40 bg-accent/10',
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
                  disabled={controller.pairing}
                  tone="secondary"
                  onPress={() => void controllerActions.openScanner()}
                />

                <View className="flex-row items-center gap-3">
                  <View className={classNames('h-px flex-1', 'bg-accent')} />
                  <Copy muted>OR ENTER A CODE</Copy>
                  <View className={classNames('h-px flex-1', 'bg-accent')} />
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
                  label={controller.pairing ? 'Pairing…' : 'Pair remote'}
                  disabled={controller.pairing}
                  onPress={() => void controllerActions.pair()}
                />

                <Toast message={controller.error} />
              </Card>
            </View>
          </ContentColumn>
        </ScrollView>
        {controller.scannerVisible && (
          <RemoteScanner
            controller={controller}
            controllerActions={controllerActions}
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}
const safeAreaStyle = {
  flex: 1,
};
