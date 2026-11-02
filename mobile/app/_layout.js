import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Loading } from '../src/components/StateViews';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { stackScreenOptions } from '../src/theme';

/** Role-based routing: the same login screen leads students and admins to different areas. */
function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) return <Loading />;

  const isAdmin = user?.role === 'ADMIN';
  const isStudent = Boolean(user) && !isAdmin;

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Protected guard={isStudent}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ride/create" options={{ title: 'New ride' }} />
        <Stack.Screen name="ride/[id]/index" options={{ title: 'Ride details' }} />
        <Stack.Screen name="ride/[id]/chat" options={{ title: 'Ride chat' }} />
      </Stack.Protected>
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="driver/[id]" options={{ title: 'Driver' }} />
        <Stack.Screen name="driver/add" options={{ title: 'Add driver' }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
