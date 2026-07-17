/* eslint-disable better-tailwindcss/no-unknown-classes */
import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, TextInput } from 'react-native';

import { SafeAreaView, ScrollView, Text, View } from '@/components/ui';
import { GeometrySketch, OwlThinkingHero } from '@/features/study/illustrations';
import { CHAT_SEED } from '@/features/study/mock-data';
import { WebShell } from '@/features/study/web-shell';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  hasSketch?: boolean;
};

export function AssistantScreen() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(CHAT_SEED);
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setThinking(false), 1600);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text)
      return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    const reply: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: 'Great question. Let us break it into steps: identify what you see, then pick the right tools. (Demo reply — no live model.)',
    };

    setThinking(true);
    setDraft('');
    setMessages(prev => [...prev, userMessage, reply]);
  };

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <OwlThinkingHero thinking={thinking} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        >
          <View className="gap-3">
            {messages.map(message => (
              <View
                key={message.id}
                className={`max-w-[90%] rounded-[22px] p-4 ${
                  message.role === 'assistant'
                    ? 'self-start bg-white'
                    : 'self-end bg-primary'
                }`}
              >
                {message.hasSketch ? <GeometrySketch /> : null}
                <Text
                  className={`font-lato text-sm/5 ${
                    message.role === 'assistant' ? 'text-on-surface' : 'text-white'
                  }`}
                >
                  {message.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="absolute inset-x-0 bottom-24 px-5">
          <Text className="font-lato mb-2 text-center text-xs text-slate-gray">
            Powered by GPT-5.
          </Text>
          <View className="flex-row items-center rounded-full bg-white px-3 py-2">
            <Pressable
              testID="attach-button"
              className="mr-2 size-9 items-center justify-center rounded-full bg-surface-alt"
            >
              <MaterialIcons name="attach-file" size={18} color="#6B7280" />
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Describe your task.."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={send}
              returnKeyType="send"
              className="font-lato flex-1 text-base text-on-surface"
              style={{ paddingVertical: 8 }}
            />
            <Pressable
              testID="send-button"
              onPress={send}
              className="size-10 items-center justify-center rounded-full bg-charcoal-800"
            >
              <MaterialIcons name="arrow-upward" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </WebShell>
  );
}
