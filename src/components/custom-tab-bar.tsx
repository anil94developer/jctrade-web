import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JC } from '@/constants/jc-theme';

/**
 * Tab glyphs use emoji + normal Text (system font). Ionicons needs Ionicons.ttf;
 * on some static hosts / CDNs that font can 404 or load after paint, so icons vanish.
 */
const TAB_CONFIG: Record<string, { label: string; glyph: string }> = {
  index: { label: 'Home', glyph: '🏠' },
  sell: { label: 'Sell', glyph: '💱' },
  wallet: { label: 'UPI', glyph: '💳' },
  support: { label: 'Support', glyph: '🎧' },
  profile: { label: 'My', glyph: '👤' },
};

export const TAB_BAR_HEIGHT = 62;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  const barHeight = TAB_BAR_HEIGHT + bottomInset;

  return (
    <View style={[styles.wrapper, { height: barHeight, paddingBottom: bottomInset }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            label: route.name,
            glyph: '•',
          };

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
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Text
                  style={[styles.tabGlyph, { opacity: focused ? 1 : 0.55 }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no">
                  {config.glyph}
                </Text>
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
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
  tabGlyph: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
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
