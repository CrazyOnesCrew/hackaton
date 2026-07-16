import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, TextInput } from 'react-native';

import { SafeAreaView, ScrollView, Text, View } from '@/components/ui';

// Placeholder AI assistant screen. It intentionally makes NO live model calls.
// Wire it to your backend (which keeps provider calls behind the API) when you
// build a real assistant — see docs/ai-development-workflow.md.
const SUGGESTED_PROMPTS = [
  'What can this template do?',
  'How do I add a new screen?',
  'Where do I configure the API URL?',
];

const MESSAGES: { role: 'assistant' | 'user'; text: string }[] = [
  {
    role: 'assistant',
    text: 'Hi! I am a placeholder AI assistant. Connect me to your backend to make me real.',
  },
];

export function AssistantScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 py-3">
        <View className="size-11 items-center justify-center rounded-full bg-ai-accent">
          <MaterialIcons name="auto-awesome" size={22} color="#ffffff" />
        </View>
        <View>
          <Text className="font-lato-black text-lg text-on-surface">AI Assistant</Text>
          <Text className="font-lato text-xs text-slate-gray">Placeholder — not connected</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
      >
        <View className="gap-3">
          {MESSAGES.map((message, index) => (
            <View
              key={index}
              className={`max-w-[85%] rounded-lg p-4 ${
                message.role === 'assistant'
                  ? 'self-start bg-pure-white shadow-sm'
                  : 'self-end bg-ai-accent'
              }`}
            >
              <Text
                className={`font-lato text-sm ${
                  message.role === 'assistant' ? 'text-on-surface' : 'text-white'
                }`}
              >
                {message.text}
              </Text>
            </View>
          ))}
        </View>

        <Text className="font-lato-bold mt-6 mb-2 text-sm text-slate-gray">Try:</Text>
        <View className="flex-row flex-wrap">
          {SUGGESTED_PROMPTS.map(prompt => (
            <View
              key={prompt}
              className="mr-2 mb-2 rounded-full border border-border bg-pure-white px-4 py-2"
            >
              <Text className="font-lato text-sm text-on-surface">{prompt}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute inset-x-0 bottom-24 px-5">
        <View className="flex-row items-center rounded-full bg-pure-white px-4 py-2 shadow-lg">
          <TextInput
            editable={false}
            placeholder="Ask something…"
            placeholderTextColor="#74798a"
            className="font-lato flex-1 text-base text-on-surface"
            style={{ paddingVertical: 6 }}
          />
          <Pressable className="size-9 items-center justify-center rounded-full bg-ai-accent">
            <MaterialIcons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
