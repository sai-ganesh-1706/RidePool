import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { makeTabScreenOptions, spacing, useTheme } from '../../src/theme';

/** Filled icon when the tab is selected, outline otherwise. */
const tabIcon = (name) =>
  function TabIcon({ color, size, focused }) {
    return <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;
  };

const headerAction = (href, icon, color) =>
  function HeaderAction() {
    return (
      <Link href={href} asChild>
        <Pressable style={{ marginRight: spacing.lg }} hitSlop={10}>
          <Ionicons name={icon} size={26} color={color} />
        </Pressable>
      </Link>
    );
  };

export default function TabsLayout() {
  const { colors } = useTheme();
  const screenOptions = useMemo(() => makeTabScreenOptions(colors), [colors]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Ride board', tabBarLabel: 'Board', tabBarIcon: tabIcon('car-sport'), headerRight: headerAction('/ride/create', 'add-circle', colors.primaryText) }}
      />
      <Tabs.Screen
        name="drivers"
        options={{ title: 'Drivers', tabBarIcon: tabIcon('call'), headerRight: headerAction('/driver/add', 'person-add-outline', colors.primaryText) }}
      />
      <Tabs.Screen name="my-rides" options={{ title: 'My rides', tabBarIcon: tabIcon('time') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
