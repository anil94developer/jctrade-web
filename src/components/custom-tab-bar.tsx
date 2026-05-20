import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TabIconHome,
  TabIconProfile,
  TabIconSell,
  TabIconSupport,
  TabIconUpi,
} from '@/components/tab-bar-icons';
import { JC } from '@/constants/jc-theme';

type IconRender = (p: { color: string }) => ReactNode;

const TAB_CONFIG: Record<string, { label: string; Icon: IconRender }> = {
  index: { label: 'Home', Icon: ({ color }) => <TabIconHome color={color} /> },
  sell: { label: 'Sell', Icon: ({ color }) => <TabIconSell color={color} /> },
  wallet: { label: 'UPI', Icon: ({ color }) => <TabIconUpi color={color} /> },
  support: { label: 'Support', Icon: ({ color }) => <TabIconSupport color={color} /> },
  profile: { label: 'My', Icon: ({ color }) => <TabIconProfile color={color} /> },
};

export const TAB_BAR_HEIGHT = 62;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  const barHeight = TAB_BAR_HEIGHT + bottomInset;

  const bar = (
    <View
      // Pinned via global.css on mobile web (portal avoids parent transform breaking fixed)
      nativeID="jc-tab-bar"
      style={[styles.wrapper, { height: barHeight, paddingBottom: bottomInset }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config =
            TAB_CONFIG[route.name] ?? ({
              label: route.name,
              Icon: ({ color }: { color: string }) => <TabIconProfile color={color} />,
            } satisfies { label: string; Icon: IconRender });
          const color = focused ? JC.black : JC.gray;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={config.label}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>{config.Icon({ color })}</View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // Live mobile browsers: fixed tab bar inside RN tree often renders off-screen (ancestor transform).
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return createPortal(bar, document.body);
  }

  return bar;
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: JC.white,
    borderTopWidth: 1,
    borderTopColor: JC.grayBorder,
    width: '100%',
    ...(Platform.OS !== 'web'
      ? {
          elevation: 12,
          shadowColor: JC.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }
      : {}),
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 2,
    minHeight: 54,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: JC.yellow,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: JC.gray,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  labelActive: {
    color: JC.black,
    fontWeight: '700',
  },
});
