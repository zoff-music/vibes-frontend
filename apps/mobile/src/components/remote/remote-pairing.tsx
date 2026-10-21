import { classNames } from '@vibes/shared';
import { ScrollView, Text, View } from 'react-native';
import {
  Button,
  Card,
  ContentColumn,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { ScreenSafeArea as SafeAreaView } from '@/components/screen-safe-area';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import type {
  ControllerRemoteActions,
  ControllerRemoteState,
} from '@/hooks/use-controller-remote';
import { usePhoneNavigationGeometry } from '@/providers/phone-navigation-provider';

interface RemotePairingProps {
  controller: ControllerRemoteState;
  controllerActions: ControllerRemoteActions;
}

export function RemotePairingV2({
  controller,
  controllerActions,
}: RemotePairingProps) {
  const theme = useAppTheme();
  const { clearance } = usePhoneNavigationGeometry();

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="flex-1 justify-center gap-5 p-4 pb-30"
            {...(clearance !== null && {
              style: { paddingBottom: clearance },
            })}
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
                    Control another Zoff screen without becoming another
                    listener.
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

                  {controller.error && (
                    <Text
                      accessibilityRole="alert"
                      accessibilityLiveRegion="polite"
                      className="font-body text-error"
                    >
                      {controller.error}
                    </Text>
                  )}
                </Card>
              </View>
            </ContentColumn>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
const safeAreaStyle = {
  flex: 1,
};
