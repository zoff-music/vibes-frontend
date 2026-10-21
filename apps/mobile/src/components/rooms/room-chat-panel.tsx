import { useRoomMessages } from '@vibes/api';
import { classNames, useChatTimeline } from '@vibes/shared';
import { useMutation } from '@vibes/shared/use-request';
import { NativeChatConversation } from '@vibes/ui/native';
import { type ReactElement, type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { TabButton } from '@/components/tab-button';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { mobileApi } from '@/lib/api';
import { useChatPreference } from '@/providers/chat-preference-provider';
import { usePhoneNavigationGeometry } from '@/providers/phone-navigation-provider';
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
  const { clearance } = usePhoneNavigationGeometry();
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
      <TabButton
        label="Up next"
        count={count}
        selected={!chat.open}
        onPress={() => chat.selectChat(false)}
      />
      <TabButton
        label="Chat"
        selected={chat.open}
        {...(chat.unread > 0 && { count: chat.unread })}
        onPress={() => chat.selectChat(true)}
      />
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
      {...(clearance !== null && { style: { paddingBottom: clearance } })}
      className={classNames(
        'min-h-0 flex-1',
        !keyboardVisible && isTablet && 'pb-16',
      )}
    >
      {!keyboardVisible && chatHeader}
      {tabs}
      <View
        className={classNames(
          'min-h-0 flex-1 overflow-hidden border',
          !isTabletLandscape && 'mx-4',
          'rounded-3xl border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
        )}
      >
        <NativeChatConversation
          controlShape="pill"
          messages={chat.messages}
          onSend={send}
          error={error}
        />
      </View>
    </View>
  );
}
