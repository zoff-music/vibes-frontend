import { chatMessageMaxLength, type RoomMessage } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import {
  chatNameColorIndex,
  crownIcon,
  formatChatMessage,
  formatChatTime,
} from '../../shared';
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
  const scrollRef = useRef<FlatList<RoomMessage>>(null);
  const nearBottom = useRef(true);
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);
  const send = async () => {
    if (sending || !draft.trim()) return;
    setSending(true);
    const sent = await onSend(draft.trim());
    if (sent) setDraft('');
    setSending(false);
  };
  return (
    <View className="min-h-0 flex-1">
      <FlatList
        ref={scrollRef}
        className="min-h-0 flex-1"
        contentContainerClassName="px-4 py-2"
        inverted
        data={newestFirst}
        keyExtractor={(message) => message.id}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        onScroll={({ nativeEvent }) => {
          nearBottom.current = nativeEvent.contentOffset.y < 80;
        }}
        scrollEventThrottle={100}
        onContentSizeChange={() => {
          if (nearBottom.current)
            scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
        }}
        ListEmptyComponent={
          <Text className="py-3 font-heading text-native-muted dark:text-native-dark-muted">
            Say hello to the room.
          </Text>
        }
        renderItem={({ item: message }) => (
          <View key={message.id} className="flex-row items-start gap-1 py-1">
            <Text className="font-heading text-native-muted text-xs leading-6 dark:text-native-dark-muted">
              {formatChatTime(message.createdAt)}{' '}
            </Text>
            {message.isAdmin && (
              <View accessibilityLabel="Room admin" className="pt-1">
                <NativeIcon definition={crownIcon} color="#ff2994" size={14} />
              </View>
            )}
            <Text className="min-w-0 flex-1 font-heading text-native-text text-sm leading-6 dark:text-native-dark-text">
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
          </View>
        )}
      />
      {Boolean(error) && (
        <Text
          accessibilityLiveRegion="polite"
          className="px-4 py-2 font-heading text-native-muted dark:text-native-dark-muted"
        >
          {error}
        </Text>
      )}
      <View className="shrink-0 flex-row items-center gap-2 border-native-border border-t bg-native-card px-3 py-3 dark:border-native-dark-border dark:bg-native-dark-card">
        <TextInput
          accessibilityLabel="Room message"
          placeholder="Send a message…"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => void send()}
          returnKeyType="send"
          maxLength={chatMessageMaxLength}
          className="h-12 min-w-0 flex-1 rounded-xl border border-native-border bg-native-surface px-4 font-heading text-base text-native-text dark:border-native-dark-border dark:bg-native-dark-surface dark:text-native-dark-text"
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
