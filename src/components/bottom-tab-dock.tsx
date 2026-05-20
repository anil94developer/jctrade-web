import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomTabBar, getTabBarTotalHeight } from '@/components/custom-tab-bar';
import { JC } from '@/constants/jc-theme';

/** Wraps tab bar — always docked to the bottom of the screen (web + native). */
export function BottomTabDock(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const height = getTabBarTotalHeight(insets.bottom);

  return (
    <View nativeID="jc-tab-bar" style={[styles.dock, { height }]}>
      <CustomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    maxWidth: JC.maxWidth,
    alignSelf: 'center',
    backgroundColor: JC.white,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 -2px 12px rgba(0,0,0,0.1)' as unknown as undefined,
        }
      : {
          elevation: 16,
        }),
  },
});
