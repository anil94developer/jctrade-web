import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { JC } from '@/constants/jc-theme';

export function MobileShell({ style, children, ...rest }: ViewProps) {
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, style]} {...rest}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: JC.grayLight,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: JC.maxWidth,
    backgroundColor: JC.white,
    position: 'relative',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 0 24px rgba(0,0,0,0.08)' as unknown as undefined,
          height: '100vh' as unknown as number,
          minHeight: '100dvh' as unknown as number,
          overflow: 'visible' as unknown as undefined,
        }
      : {}),
  },
});
