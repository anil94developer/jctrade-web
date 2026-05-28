import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabDock } from '@/components/bottom-tab-dock';
import { getTabBarTotalHeight } from '@/components/custom-tab-bar';
import { MobileShell } from '@/components/mobile-shell';
import { useAuth } from '@/context/auth-context';
import { JC } from '@/constants/jc-theme';

export default function TabsLayout() {
  const { token, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarTotalHeight(insets.bottom);

  if (!loading && !token) {
    return <Redirect href="/login" />;
  }

  return (
    <MobileShell>
      <View style={styles.page}>
        <Tabs
          initialRouteName="home"
          tabBar={(props) => <BottomTabDock {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: JC.white,
              paddingBottom: tabBarHeight,
            },
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: tabBarHeight,
              borderTopWidth: 0,
              backgroundColor: 'transparent',
              elevation: 0,
            },
          }}>
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
            }}
          />

          <Tabs.Screen
            name="sell"
            options={{
              title: 'Order',
            }}
          />

          <Tabs.Screen
            name="team"
            options={{
              title: 'Team',
            }}
          />

          <Tabs.Screen
            name="support"
            options={{
              title: 'Support',
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: 'My',
            }}
          />
        </Tabs>
      </View>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: JC.white,
  },
});