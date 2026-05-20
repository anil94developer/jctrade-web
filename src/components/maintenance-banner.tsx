import { StyleSheet, Text, View } from 'react-native';

import { JC } from '@/constants/jc-theme';

export function MaintenanceBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ System under maintenance. Sell requests are temporarily disabled.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: JC.red,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  text: { color: JC.red, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
