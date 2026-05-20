import { StyleSheet, Text, View } from 'react-native';

import { JC } from '@/constants/jc-theme';

export function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  bar: { width: 4, height: 20, backgroundColor: JC.yellow, borderRadius: 2 },
  title: { fontSize: 17, fontWeight: '700', color: JC.black },
});
