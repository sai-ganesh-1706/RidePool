import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { colors, spacing } from '../../src/theme';

export const unstable_settings = { initialRouteName: 'dashboard' };

const tabIcon = (name) =>
  function TabIcon({ color, size }) {
    return <Ionicons name={name} size={size} color={color} />;
  };

function AddDriverAction() {
  return (
    <Link href="/driver/add" asChild>
      <Pressable style={{ marginRight: spacing.lg }} hitSlop={10}>
        <Ionicons name="person-add-outline" size={24} color={colors.primary} />
      </Pressable>
    </Link>
  );
}

export default function AdminLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Pending drivers', tabBarLabel: 'Pending', tabBarIcon: tabIcon('shield-checkmark-outline') }} />
      <Tabs.Screen name="all-drivers" options={{ title: 'All drivers', tabBarLabel: 'Drivers', tabBarIcon: tabIcon('call-outline'), headerRight: AddDriverAction }} />
      <Tabs.Screen name="admin-profile" options={{ title: 'Admin profile', tabBarLabel: 'Profile', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
