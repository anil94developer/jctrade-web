import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TabIconHome,
  TabIconOrder,
  TabIconProfile,
  TabIconTeam,
  TabIconUpi,
} from '@/components/tab-bar-icons';
import { JC } from '@/constants/jc-theme';

type IconRender = (p: { color: string }) => ReactNode;

const TAB_CONFIG: Record<string, { label: string; Icon: IconRender; center?: boolean }> = {
  index: { label: 'Home', Icon: ({ color }) => <TabIconHome color={color} /> },
  sell: { label: 'Order', Icon: ({ color }) => <TabIconOrder color={color} /> },
  wallet: { label: 'UPI', Icon: ({ color }) => <TabIconUpi color={color} />, center: true },
  team: { label: 'Team', Icon: ({ color }) => <TabIconTeam color={color} /> },
  profile: { label: 'My', Icon: ({ color }) => <TabIconProfile color={color} /> },
};

export const TAB_BAR_HEIGHT = 56;

export function getTabBarTotalHeight(insetsBottom = 0) {
  const safe = Platform.OS === 'web' ? insetsBottom : Math.max(insetsBottom, 8);
  return TAB_BAR_HEIGHT + safe;
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.wrapper, { paddingBottom: safeBottom }]}>
      <View style={styles.bar} collapsable={false}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config =
            TAB_CONFIG[route.name] ?? ({
              label: route.name,
              Icon: ({ color }: { color: string }) => <TabIconProfile color={color} />,
            } satisfies { label: string; Icon: IconRender });
          const color = focused ? JC.green : JC.gray;
          const isCenter = config.center;

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
              style={[styles.tab, isCenter && styles.tabCenter]}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={config.label}>
              {isCenter ? (
                <View style={[styles.centerBtn, focused && styles.centerBtnActive]}>
                  {config.Icon({ color: JC.white })}
                </View>
              ) : (
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  {config.Icon({ color })}
                </View>
              )}
              <Text
                style={[styles.label, focused && styles.labelActive, isCenter && styles.labelCenter]}
                numberOfLines={1}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: JC.white,
    borderTopWidth: 1,
    borderTopColor: JC.grayBorder,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' as unknown as undefined,
        }
      : {
          elevation: 12,
          shadowColor: JC.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    height: TAB_BAR_HEIGHT,
  },
  tabCenter: {},
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: JC.greenLight,
  },
  centerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: JC.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(27,138,74,0.45)' as unknown as undefined }
      : {
          elevation: 8,
          shadowColor: JC.green,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
        }),
  },
  centerBtnActive: {
    backgroundColor: JC.greenDark,
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
    color: JC.green,
    fontWeight: '700',
  },
  labelCenter: {
    marginTop: 6,
  },
});
