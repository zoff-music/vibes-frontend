import { useRoomMessages } from '@vibes/api';
import { classNames, useChatTimeline } from '@vibes/shared';
import { useMutation } from '@vibes/shared/use-request';
import {
  NativeChatConversation,
  NativePressable as Pressable,
} from '@vibes/ui/native';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Text, View } from 'react-native';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { mobileApi } from '@/lib/api';
import { useChatPreference } from '@/providers/chat-preference-provider';
import { updateMessages } from '@/requests/update-messages';

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
  const { isTablet, isTabletLandscape } = useTabletLandscapeLayout();
  const preference = useChatPreference();
  const enabled = preference.loaded && preference.enabled;
  const chat = useChatTimeline(roomId, enabled);
  const [error, setError] = useState('');
  const [, fetcherSubmit] = useMutation(updateMessages, {
    id: roomId,
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
    const result = await fetcherSubmit({
      text,
    });
    setError(result.error);

    return Boolean(result.data);
  };
  const tabs = enabled && (
    <View
      className={classNames(
        'mb-4 flex-row gap-3',
        !isTabletLandscape && 'mx-4',
      )}
    >
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{
          selected: !chat.open,
        }}
        onPress={() => chat.selectChat(false)}
        className={classNames(
          'min-h-13 flex-1 flex-row items-center justify-center gap-2 border px-4 py-3',
          'rounded-full',
          !chat.open && 'border-accent/40 bg-accent/10',
          chat.open &&
            'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
        )}
      >
        <Text className="font-heading text-base text-mobile-text dark:text-mobile-dark-text">
          Up next
        </Text>
        <Text className="font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
          {count}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{
          selected: chat.open,
        }}
        onPress={() => chat.selectChat(true)}
        className={classNames(
          'min-h-13 flex-1 flex-row items-center justify-center gap-2 border px-4 py-3',
          'rounded-full',
          chat.open && 'border-accent/40 bg-accent/10',
          !chat.open &&
            'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
        )}
      >
        <Text className="font-heading text-base text-mobile-text dark:text-mobile-dark-text">
          Chat
        </Text>
        {chat.unread > 0 && (
          <Text className="font-heading text-accent text-sm">
            {chat.unread}
          </Text>
        )}
      </Pressable>
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
        !keyboardVisible && !isTablet && 'pb-28',
        !keyboardVisible && isTablet && 'pb-16',
      )}
    >
      {!keyboardVisible && chatHeader}
      {tabs}
      <View
        className={classNames(
          'min-h-0 flex-1 overflow-hidden border',
          !isTabletLandscape && 'mx-4',
          'rounded-2xl border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
        )}
      >
        <NativeChatConversation
          messages={chat.messages}
          onSend={send}
          error={error}
        />
      </View>
    </View>
  );
}
