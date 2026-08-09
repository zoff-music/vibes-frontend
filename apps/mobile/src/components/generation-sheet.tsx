import { type ApiClient, useRoomRequests } from '@vibes/api';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  IconButton,
  Screen,
} from '@/components/native';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface GenerationSheetProps {
  client?: ApiClient;
  onClose: () => void;
  onGenerated: (roomId?: string) => Promise<void>;
  roomId?: string;
  visible: boolean;
}

export function GenerationSheet({
  client = mobileApi,
  onClose,
  onGenerated,
  roomId,
  visible,
}: GenerationSheetProps) {
  const roomRequests = useRoomRequests(client);
  const inputRef = useRef<TextInput>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), focusDelayMs);
    return () => clearTimeout(timeout);
  }, [visible]);

  const generate = async () => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      setError('Describe the playlist you want.');
      return;
    }
    setLoading(true);
    const [requestError, result] = roomId
      ? await roomRequests.generatePlaylist(roomId, {
          prompt: normalizedPrompt,
        })
      : await roomRequests.createGeneratedRoom({ prompt: normalizedPrompt });
    setLoading(false);
    if (requestError || !result) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not start playlist generation.',
        ),
      );
      return;
    }
    await onGenerated('id' in result ? result.id : roomId);
    setPrompt('');
    setError('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen>
        <SafeAreaView className="flex-1 p-5" edges={['top', 'bottom']}>
          <View className="mb-5 flex-row items-center justify-between gap-4">
            <IconButton
              accessibilityLabel="Close playlist generation"
              icon="close"
              onPress={onClose}
            />
            <View className="min-w-0 flex-1">
              <Heading>{roomId ? 'Fill playlist' : 'Generate a room'}</Heading>
            </View>
          </View>
          <Card>
            <Copy muted>PLAYLIST IDEA</Copy>
            <Field
              ref={inputRef}
              autoCapitalize="sentences"
              value={prompt}
              onChangeText={(value) => {
                setPrompt(value.slice(0, generatedPlaylistPromptMaxLength));
                setError('');
              }}
              onSubmitEditing={() => void generate()}
              placeholder="Late-night synthwave for a rainy drive"
            />
            <Copy muted>
              {prompt.length}/{generatedPlaylistPromptMaxLength}
            </Copy>
            {Boolean(error) && (
              <Text className="font-heading text-error text-xs">{error}</Text>
            )}
            <Button
              disabled={loading || !prompt.trim()}
              icon="sparkles"
              label={loading ? 'Starting generation…' : 'Generate playlist'}
              onPress={() => void generate()}
            />
          </Card>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}

const focusDelayMs = 250;
