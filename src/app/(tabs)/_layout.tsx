import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomTabBar, TAB_BAR_HEIGHT } from '@/components/custom-tab-bar';
import { MobileShell } from '@/components/mobile-shell';
import { useAuth } from '@/context/auth-context';
import { JC } from '@/constants/jc-theme';

export default function TabsLayout() {
  const { token, loading } = useAuth();
  const insets = useSafeAreaInsets();
  // Tab bar height only — profile logout sits in screen footer above tabs
  const contentBottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

  if (!loading && !token) return <Redirect href="/login" />;

  return (
    <MobileShell>
      <View style={styles.root}>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: JC.white, paddingBottom: contentBottom },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="sell" options={{ title: 'Sell' }} />
          <Tabs.Screen name="wallet" options={{ title: 'UPI' }} />
          <Tabs.Screen name="support" options={{ title: 'Support' }} />
          <Tabs.Screen name="profile" options={{ title: 'My' }} />
        </Tabs>
      </View>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: JC.white,
  },
});
