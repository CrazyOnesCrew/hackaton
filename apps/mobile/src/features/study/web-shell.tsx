import * as React from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Centers the student UI on wide web viewports for demo / presentation. */
export function WebShell({ children, className = '' }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 768;

  if (!isWideWeb) {
    return <View className={`flex-1 ${className}`}>{children}</View>;
  }

  return (
    <View className="flex-1 items-center bg-primary-50">
      <View
        className={`w-full max-w-md flex-1 overflow-hidden bg-background shadow-soft ${className}`}
        style={{ maxWidth: 440 }}
      >
        {children}
      </View>
    </View>
  );
}
