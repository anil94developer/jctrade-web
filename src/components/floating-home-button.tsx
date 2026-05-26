import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIconHome } from '@/components/tab-bar-icons';
import { getTabBarTotalHeight } from '@/components/custom-tab-bar';
import { JC } from '@/constants/jc-theme';

/** Floating action — Home on all tab screens (including Home). */
export function FloatingHomeButton() {
  const insets = useSafeAreaInsets();
  const bottom = getTabBarTotalHeight(insets.bottom) + 12;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Pressable
        style={styles.btn}
        onPress={() => router.push('/(tabs)')}
        accessibilityRole="button"
        accessibilityLabel="Go to Home">
        <TabIconHome size={26} color={JC.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    zIndex: 99998,
    ...(Platform.OS === 'web'
      ? { position: 'fixed' as 'absolute' }
      : {}),
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: JC.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 14px rgba(27,138,74,0.45)' as unknown as undefined }
      : {
          elevation: 8,
          shadowColor: JC.green,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
        }),
  },
});
