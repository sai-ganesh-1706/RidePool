import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { colors, spacing } from '../../src/theme';

const tabIcon = (name) =>
  function TabIcon({ color, size }) {
    return <Ionicons name={name} size={size} color={color} />;
  };

const headerAction = (href, icon) =>
  function HeaderAction() {
    return (
      <Link href={href} asChild>
        <Pressable style={{ marginRight: spacing.lg }} hitSlop={10}>
          <Ionicons name={icon} size={26} color={colors.primary} />
        </Pressable>
      </Link>
    );
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Ride board', tabBarIcon: tabIcon('car-sport-outline'), headerRight: headerAction('/ride/create', 'add-circle') }}
      />
      <Tabs.Screen
        name="drivers"
        options={{ title: 'Drivers', tabBarIcon: tabIcon('call-outline'), headerRight: headerAction('/driver/add', 'person-add-outline') }}
      />
      <Tabs.Screen name="my-rides" options={{ title: 'My rides', tabBarIcon: tabIcon('time-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
