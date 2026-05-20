import { StyleSheet, Text, View } from 'react-native';

import { JC } from '@/constants/jc-theme';

type Props = { size?: 'sm' | 'md' | 'lg' };

export function JcLogo({ size = 'md' }: Props) {
  const dim = size === 'lg' ? 88 : size === 'sm' ? 48 : 64;
  const fontSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 22;

  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        <Text style={[styles.text, { fontSize }]}>JC</Text>
      </View>
      <Text style={[styles.brand, size === 'lg' && styles.brandLg]}>JCTRADE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  circle: {
    backgroundColor: JC.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: JC.black,
  },
  text: { fontWeight: '900', color: JC.black, letterSpacing: 1 },
  brand: { fontSize: 22, fontWeight: '800', color: JC.black, letterSpacing: 2 },
  brandLg: { fontSize: 32 },
});
