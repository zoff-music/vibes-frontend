import type { RoomMessage } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { chatNameColorIndex, crownIcon, formatChatMessage } from '../../shared';
import { NativeIcon } from '../icons/NativeIcon';
import { NativeButton } from './NativePrimitives';

interface Props {
  messages: RoomMessage[];
  onSend: (text: string) => Promise<boolean>;
  error: string;
}
const nameColors = [
  'text-sky-700 dark:text-sky-300',
  'text-violet-700 dark:text-violet-300',
  'text-amber-800 dark:text-amber-200',
  'text-emerald-700 dark:text-emerald-300',
  'text-pink-700 dark:text-pink-300',
];
export function NativeChatConversation({ messages, onSend, error }: Props) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const nearBottom = useRef(true);
  const send = async () => {
    if (sending || !draft.trim()) return;
    setSending(true);
    const sent = await onSend(draft.trim());
    if (sent) setDraft('');
    setSending(false);
  };
  return (
    <View className="min-h-0 flex-1">
      <ScrollView
        ref={scrollRef}
        className="min-h-0 flex-1"
        keyboardShouldPersistTaps="handled"
        onScroll={({ nativeEvent }) => {
          nearBottom.current =
            nativeEvent.contentSize.height -
              nativeEvent.contentOffset.y -
              nativeEvent.layoutMeasurement.height <
            80;
        }}
        scrollEventThrottle={100}
        onContentSizeChange={() => {
          if (nearBottom.current)
            scrollRef.current?.scrollToEnd({ animated: false });
        }}
      >
        <View className="px-4 py-2">
          {messages.length === 0 && (
            <Text className="py-3 font-heading text-native-muted dark:text-native-dark-muted">
              Say hello to the room.
            </Text>
          )}
          {messages.map((message) => (
            <Text
              key={message.id}
              className="py-1 font-heading text-native-text text-sm leading-6 dark:text-native-dark-text"
            >
              {message.isAdmin && (
                <Text accessibilityLabel="Room admin ">
                  <NativeIcon
                    definition={crownIcon}
                    color="#ff2994"
                    size={14}
                  />{' '}
                </Text>
              )}
              <Text className={nameColors[chatNameColorIndex(message.userId)]}>
                {message.name}
              </Text>
              {message.kind === 'chat' ? ': ' : ' '}
              <Text
                className={classNames(
                  message.kind !== 'chat' &&
                    'text-native-muted dark:text-native-dark-muted',
                )}
              >
                {formatChatMessage(message)}
              </Text>
            </Text>
          ))}
        </View>
      </ScrollView>
      {Boolean(error) && (
        <Text
          accessibilityLiveRegion="polite"
          className="px-4 py-2 font-heading text-native-muted dark:text-native-dark-muted"
        >
          {error}
        </Text>
      )}
      <View className="mx-4 flex-row items-center gap-2 border-native-border border-t py-3 dark:border-native-dark-border">
        <TextInput
          accessibilityLabel="Room message"
          placeholder="Send a message…"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => void send()}
          returnKeyType="send"
          maxLength={500}
          className="h-12 min-w-0 flex-1 rounded-xl border border-native-border bg-native-surface px-4 font-heading text-native-text dark:border-native-dark-border dark:bg-native-dark-surface dark:text-native-dark-text"
        />
        <NativeButton
          accessibilityLabel="Send message"
          label="Send"
          disabled={sending || !draft.trim()}
          onPress={() => void send()}
        />
      </View>
    </View>
  );
}
