import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { makeTabScreenOptions, spacing, useTheme } from '../../src/theme';

export const unstable_settings = { initialRouteName: 'dashboard' };

const tabIcon = (name) =>
  function TabIcon({ color, size, focused }) {
    return <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;
  };

const addDriverAction = (color) =>
  function AddDriverAction() {
    return (
      <Link href="/driver/add" asChild>
        <Pressable style={{ marginRight: spacing.lg }} hitSlop={10}>
          <Ionicons name="person-add-outline" size={24} color={color} />
        </Pressable>
      </Link>
    );
  };

export default function AdminLayout() {
  const { colors } = useTheme();
  const screenOptions = useMemo(() => makeTabScreenOptions(colors), [colors]);

  return (
    <Tabs initialRouteName="dashboard" screenOptions={screenOptions}>
      <Tabs.Screen name="dashboard" options={{ title: 'Pending drivers', tabBarLabel: 'Pending', tabBarIcon: tabIcon('shield-checkmark') }} />
      <Tabs.Screen name="all-drivers" options={{ title: 'All drivers', tabBarLabel: 'Drivers', tabBarIcon: tabIcon('call'), headerRight: addDriverAction(colors.primaryText) }} />
      <Tabs.Screen name="admin-profile" options={{ title: 'Admin profile', tabBarLabel: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
