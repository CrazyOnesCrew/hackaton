/* eslint-disable better-tailwindcss/no-unknown-classes */
import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';

import { Text, View } from '@/components/ui';

/** Soft decorative hero for the course detail (cat professor vibe). */
export function CatProfessorHero() {
  return (
    <View className="relative h-56 w-full items-center justify-center overflow-hidden rounded-[28px] bg-accent-soft">
      <View className="absolute top-8 left-6 size-10 rotate-12 items-center justify-center rounded-2xl bg-white/80">
        <Text className="font-lato-bold text-xs text-accent">E=mc²</Text>
      </View>
      <View className="absolute top-10 right-8 size-8 items-center justify-center rounded-full bg-primary-soft">
        <MaterialIcons name="change-history" size={18} color="#8B74E8" />
      </View>
      <View className="absolute bottom-8 left-10 size-9 items-center justify-center rounded-2xl bg-white/70">
        <MaterialIcons name="category" size={20} color="#F5A623" />
      </View>
      <View className="size-36 items-center justify-center rounded-full bg-white">
        <View className="size-28 items-center justify-center rounded-full bg-primary-soft">
          <MaterialIcons name="pets" size={64} color="#8B74E8" />
        </View>
      </View>
      <View className="absolute right-12 bottom-10 rounded-full bg-white px-3 py-1">
        <MaterialIcons name="school" size={22} color="#F5A623" />
      </View>
    </View>
  );
}

/** Owl mascot header for the AI assistant. */
export function OwlThinkingHero({ thinking = true }: { thinking?: boolean }) {
  return (
    <View className="items-center px-6 pt-2 pb-4">
      <View className="relative size-28 items-center justify-center rounded-full bg-primary-soft">
        <View className="size-24 items-center justify-center rounded-full bg-white">
          <MaterialIcons name="nightlight-round" size={52} color="#8B74E8" />
        </View>
        <View className="absolute -top-1 -right-1 size-9 items-center justify-center rounded-full bg-accent">
          <MaterialIcons name="school" size={18} color="#ffffff" />
        </View>
        <View className="absolute -bottom-1 -left-1 size-8 items-center justify-center rounded-full bg-white">
          <MaterialIcons name="menu-book" size={16} color="#F5A623" />
        </View>
      </View>
      <Text className="font-lato-bold mt-3 text-base text-on-surface">
        {thinking ? 'AI Owl is Thinking..' : 'AI Owl is ready'}
      </Text>
    </View>
  );
}

/** Mini geometry sketch placeholder inside a chat bubble. */
export function GeometrySketch() {
  return (
    <View className="mb-2 h-36 w-full overflow-hidden rounded-2xl bg-surface-alt p-3">
      <View className="flex-1 flex-row items-center justify-around">
        <View className="size-16 items-center justify-center rounded-xl border-2 border-primary-300 bg-white">
          <MaterialIcons name="change-history" size={36} color="#8B74E8" />
        </View>
        <View className="size-16 items-center justify-center rounded-xl border-2 border-accent bg-white">
          <MaterialIcons name="crop-square" size={32} color="#F5A623" />
        </View>
        <View className="size-16 items-center justify-center rounded-xl border-2 border-primary bg-white">
          <MaterialIcons name="panorama-fish-eye" size={32} color="#B9A5F5" />
        </View>
      </View>
      <Text className="font-lato mt-1 text-center text-[10px] text-slate-gray">
        Geometry sketch
      </Text>
    </View>
  );
}
