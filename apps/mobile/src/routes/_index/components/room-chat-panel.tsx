import { useRoomMessages } from '@vibes/api';
import type { RoomMessage } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { classNames, useChatTimeline } from '@vibes/shared';
import { NativeChatConversation } from '@vibes/ui/native';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mobileApi } from '@/lib/api';
import { useChatPreference } from '@/providers/chat-preference-provider';

interface Props {
  roomId: string;
  count: number;
  children: ReactNode;
}
export function RoomChatPanel({ roomId, count, children }: Props) {
  const preference = useChatPreference();
  const enabled = preference.loaded && preference.enabled;
  const chat = useChatTimeline(roomId, enabled);
  const [error, setError] = useState('');
  const [, fetcher] = useFetcher<RoomMessage>({
    routeId: 'rooms.$id.messages',
    params: { id: roomId },
  });
  useRoomMessages(
    enabled ? roomId : undefined,
    {
      onMessage: chat.receive,
      onError: (failure) => setError(failure ? 'Chat is reconnecting…' : ''),
    },
    mobileApi,
  );
  const send = async (text: string) => {
    const result = await fetcher.submit({ text });
    setError(result.error);
    return Boolean(result.data);
  };
  return (
    <View className="min-h-0 flex-1">
      <View className="mx-4 flex-row justify-between border-mobile-border border-b dark:border-mobile-dark-border">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !chat.open }}
          onPress={() => chat.selectChat(false)}
          className={classNames(
            'min-h-12 justify-center border-b-2',
            chat.open ? 'border-transparent' : 'border-accent',
          )}
        >
          <Text className="font-heading text-mobile-text dark:text-mobile-dark-text">
            Up next ({count})
          </Text>
        </Pressable>
        {enabled && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: chat.open }}
            onPress={() => chat.selectChat(true)}
            className={classNames(
              'min-h-12 justify-center border-b-2',
              chat.open ? 'border-accent' : 'border-transparent',
            )}
          >
            <Text className="font-heading text-mobile-text dark:text-mobile-dark-text">
              Chat ({chat.unread})
            </Text>
          </Pressable>
        )}
      </View>
      {chat.open && (
        <NativeChatConversation
          messages={chat.messages}
          onSend={send}
          error={error}
        />
      )}
      {!chat.open && children}
    </View>
  );
}
