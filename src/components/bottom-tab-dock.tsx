import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { CustomTabBar } from '@/components/custom-tab-bar';
import { JC } from '@/constants/jc-theme';

/** Wraps tab bar — always docked to the bottom of the screen (web + native). */
export function BottomTabDock(props: BottomTabBarProps) {
  return (
    <View nativeID="jc-tab-bar" style={styles.dock}>
      <CustomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: JC.maxWidth,
    alignSelf: 'center',
    backgroundColor: JC.white,
    zIndex: 99999,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 -2px 12px rgba(0,0,0,0.1)' as unknown as undefined,
        }
      : {
          elevation: 16,
        }),
  },
});
