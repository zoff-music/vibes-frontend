import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ContentColumn, Field, Screen } from '@/components/native';
import {
  NativeTerminalSection,
  NativeTerminalShell,
  NativeTerminalToolbar,
} from '@/components/native-terminal-shell';
import { ZoffIcon } from '@/components/zoff-icon';

interface TerminalRoomsHomeProps {
  generationLoading: boolean;
  isAIMode: boolean;
  loading: boolean;
  onChangeValue: (value: string) => void;
  onJoinRoom: (roomId: string) => void;
  onSubmit: () => void;
  onToggleAIMode: () => void;
  providers: string[];
  publicRooms: PublicRoom[];
  submitLabel: string;
  value: string;
}

export function TerminalRoomsHome({
  generationLoading,
  isAIMode,
  loading,
  onChangeValue,
  onJoinRoom,
  onSubmit,
  onToggleAIMode,
  providers,
  publicRooms,
  submitLabel,
  value,
}: TerminalRoomsHomeProps) {
  const listenerCount = publicRooms.reduce(
    (total, room) => total + room.listenerCount,
    0,
  );

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="px-3 pt-3 pb-40"
          keyboardShouldPersistTaps="handled"
        >
          <ContentColumn>
            <NativeTerminalShell
              channel="SIGNAL DIRECTORY"
              title="HOME"
              footer={
                <>
                  <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
                    {listenerCount.toString().padStart(3, '0')} LISTENERS
                  </Text>
                  <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
                    KONAMI LINK ACTIVE
                  </Text>
                </>
              }
            >
              <NativeTerminalToolbar
                description="PUBLIC ROOM DISCOVERY / SHARED PLAYBACK PROTOCOL"
                title="ZOFF / SIGNAL DIRECTORY"
              />
              <NativeTerminalSection
                label={isAIMode ? 'AI PLAYLIST COMMAND' : 'ROOM UPLINK'}
                status={generationLoading || loading ? 'PROCESSING' : 'READY'}
              >
                <View className="gap-4 border border-[#55ffad] bg-[#010c08] p-4">
                  <View className="gap-1 border-[#71f5ad]/20 border-b pb-4">
                    <Text className="font-heading text-[#71f5ad]/55 text-[10px] uppercase tracking-widest">
                      CURRENT COMMAND
                    </Text>
                    <Text className="font-heading text-[#e0ffef] text-base uppercase">
                      {isAIMode
                        ? 'GENERATE PLAYLIST SIGNAL'
                        : 'CONNECT TO ROOM CHANNEL'}
                    </Text>
                    <Text className="font-heading text-[#a6ffd0]/55 text-xs uppercase">
                      {isAIMode
                        ? 'DESCRIBE THE SOUND TO COMPILE'
                        : 'ENTER AN EXISTING CHANNEL NAME'}
                    </Text>
                  </View>
                  <View className="gap-2">
                    <Text className="font-heading text-[#71f5ad]/65 text-[10px] uppercase tracking-widest">
                      {isAIMode ? 'PLAYLIST PROMPT' : 'CHANNEL IDENTIFIER'}
                    </Text>
                    <Field
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChangeValue}
                      onSubmitEditing={onSubmit}
                      placeholder={
                        isAIMode
                          ? 'Late-night synthwave for a rainy drive'
                          : 'Room name'
                      }
                      trailingAction={
                        <Pressable
                          accessibilityLabel={
                            isAIMode ? 'Turn off AI mode' : 'Generate with AI'
                          }
                          accessibilityRole="switch"
                          accessibilityState={{ checked: isAIMode }}
                          className={classNames(
                            'size-11 items-center justify-center border border-[#55ffad] active:opacity-70',
                            isAIMode && 'bg-[#71f5ad]',
                          )}
                          onPress={onToggleAIMode}
                        >
                          <ZoffIcon
                            color={isAIMode ? '#03150d' : '#71f5ad'}
                            name="sparkles"
                            size={20}
                          />
                        </Pressable>
                      }
                    />
                  </View>
                  <Button
                    disabled={loading || generationLoading}
                    label={`[ ${submitLabel.toUpperCase()} ]`}
                    onPress={onSubmit}
                  />
                  {(generationLoading || loading) && (
                    <View className="border border-[#71f5ad]/35 bg-[#71f5ad]/5 p-3">
                      <Text className="font-heading text-[#71f5ad] text-xs uppercase tracking-widest">
                        {generationLoading
                          ? 'COMPILING PLAYLIST SIGNAL_'
                          : 'CHECKING ROOM CHANNEL_'}
                      </Text>
                    </View>
                  )}
                  <View className="gap-2 border-[#71f5ad]/20 border-t pt-4">
                    <TerminalRegister
                      label="INTERFACE"
                      value={isAIMode ? 'AI GENERATOR' : 'ROOM DIRECTORY'}
                    />
                    <TerminalRegister
                      label="LISTENERS"
                      value={`${listenerCount.toString().padStart(3, '0')} ONLINE`}
                    />
                    <TerminalRegister
                      label="ROOM INDEX"
                      value={`${publicRooms.length.toString().padStart(2, '0')} VISIBLE`}
                    />
                  </View>
                </View>
              </NativeTerminalSection>
              <NativeTerminalSection
                label="ACTIVE CHANNELS"
                status={`${publicRooms.length.toString().padStart(2, '0')} FOUND`}
              >
                <View className="gap-2 border border-[#55ffad] bg-[#010c08] p-2">
                  {publicRooms.length === 0 && (
                    <View className="border border-[#71f5ad]/30 p-4">
                      <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
                        NO PUBLIC SIGNALS DETECTED.
                      </Text>
                    </View>
                  )}
                  {publicRooms.map((room, index) => (
                    <Pressable
                      className="flex-row items-center gap-3 border border-[#71f5ad]/30 p-3 active:bg-[#71f5ad]/10"
                      key={room.id}
                      onPress={() => onJoinRoom(room.id)}
                    >
                      <Text className="font-heading text-[#71f5ad]/60 text-xs">
                        {(index + 1).toString().padStart(2, '0')}
                      </Text>
                      <View className="min-w-0 flex-1 gap-1">
                        <Text
                          className="font-heading text-[#e0ffef] text-sm uppercase"
                          numberOfLines={1}
                        >
                          {room.name}
                        </Text>
                        <Text className="font-heading text-[#a6ffd0]/55 text-[10px] uppercase tracking-wider">
                          {room.listenerCount.toString().padStart(3, '0')} USERS
                          / {room.songCount.toString().padStart(3, '0')} TRACKS
                          / ONLINE
                        </Text>
                      </View>
                      <Text className="font-heading text-[#71f5ad] text-xs uppercase">
                        ENTER
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </NativeTerminalSection>
              <NativeTerminalSection label="SYSTEM SIGNAL" status="ONLINE">
                <View className="gap-2 border border-[#55ffad] bg-[#010c08] p-4">
                  <TerminalRegister
                    label="PROVIDER DRIVERS"
                    value={providers.join(' / ') || 'NONE'}
                  />
                  <TerminalRegister
                    label="DIRECTORY LINK"
                    value="LOCKED / SECURE"
                  />
                  <TerminalRegister
                    label="PLAYBACK NETWORK"
                    value="READY / STANDBY"
                  />
                </View>
              </NativeTerminalSection>
            </NativeTerminalShell>
          </ContentColumn>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function TerminalRegister({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="font-heading text-[#71f5ad]/55 text-[10px] uppercase tracking-widest">
        {label}
      </Text>
      <Text className="min-w-0 flex-1 text-right font-heading text-[#dffff0] text-xs uppercase">
        {value}
      </Text>
    </View>
  );
}
