import { NativeQrCode } from '@vibes/ui/native';
import { Text, View } from 'react-native';

import zoffLogo from '@/assets/images/icon.png';
import { Button, Card, Copy } from '@/components/native';
import { useApp } from '@/providers/app-provider';

export function DeviceRemoteSettings() {
  const {
    disableMachineRemote,
    enableMachineRemote,
    machinePairing,
    machineRemote,
  } = useApp();
  const pairingUrl = machinePairing
    ? `https://zoff.me/remotes?remoteId=${encodeURIComponent(machinePairing.id)}&pair=${encodeURIComponent(machinePairing.pairingToken)}`
    : '';

  return (
    <View className="gap-3">
      <Copy muted>REMOTE CONTROL</Copy>
      <Card>
        <Copy muted>
          Allow one paired device to control this app without becoming another
          listener.
        </Copy>
        {machineRemote?.paired && (
          <View className="rounded-xl border border-accent/40 bg-accent/10 p-4">
            <Text className="font-heading text-accent text-base">
              Remote connected
            </Text>
            <Copy muted>
              Disable remote control below to revoke access immediately.
            </Copy>
          </View>
        )}
        {machinePairing && (
          <View className="items-center gap-3">
            <View className="items-center">
              <NativeQrCode logo={zoffLogo} size={220} value={pairingUrl} />
            </View>
            <Copy muted>REMOTE ID</Copy>
            <Copy>{machinePairing.id}</Copy>
            <Copy muted>PAIRING CODE</Copy>
            <Text className="font-heading text-2xl text-accent tracking-widest">
              {machinePairing.pairingCode}
            </Text>
            <Copy muted>This pairing is single-use and expires shortly.</Copy>
          </View>
        )}
        <Button
          icon="remote"
          label={
            machineRemote?.enabled ? 'Create new pairing' : 'Enable remote'
          }
          onPress={() => void enableMachineRemote()}
        />
        {machineRemote?.enabled && (
          <Button
            label="Disable remote"
            tone="danger"
            onPress={() => void disableMachineRemote()}
          />
        )}
      </Card>
    </View>
  );
}
