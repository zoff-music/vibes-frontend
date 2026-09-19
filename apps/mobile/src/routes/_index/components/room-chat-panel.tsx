import { useRoomMessages } from '@vibes/api';
import type { RoomMessage } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { classNames, useChatTimeline } from '@vibes/shared';
import { NativeChatConversation } from '@vibes/ui/native';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { mobileApi } from '@/lib/api';
import { useChatPreference } from '@/providers/chat-preference-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

interface Props {
  roomId: string;
  count: number;
  header?: ReactElement;
  chatHeader?: ReactElement;
  renderQueue: (header: ReactElement, showHeading: boolean) => ReactNode;
}
export function RoomChatPanel({
  roomId,
  count,
  header,
  chatHeader,
  renderQueue,
}: Props) {
  const keyboardVisible = useKeyboardVisible();
  const { isTablet } = useTabletLandscapeLayout();
  const { enabled: terminal } = useKonamiMode();
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
  const tabs = enabled && (
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
            {chat.unread > 0 ? `Chat (${chat.unread})` : 'Chat'}
          </Text>
        </Pressable>
      )}
    </View>
  );
  if (!chat.open) {
    return renderQueue(
      <>
        {header}
        {tabs}
      </>,
      !enabled,
    );
  }
  return (
    <View
      className={classNames(
        'min-h-0 flex-1',
        !keyboardVisible && (!isTablet || terminal) && 'pb-28',
        !keyboardVisible && isTablet && !terminal && 'pb-16',
      )}
    >
      {!keyboardVisible && chatHeader}
      {tabs}
      <View className="mx-4 my-2 min-h-0 flex-1 overflow-hidden rounded-2xl border border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card">
        <NativeChatConversation
          messages={chat.messages}
          onSend={send}
          error={error}
        />
      </View>
    </View>
  );
}
