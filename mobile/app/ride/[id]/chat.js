import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getErrorMessage } from '../../../src/api/client';
import { ridesApi } from '../../../src/api/rides';
import { createSocket } from '../../../src/api/socket';
import { EmptyState } from '../../../src/components/StateViews';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, radius, spacing } from '../../../src/theme';
import { formatTime } from '../../../src/utils/format';

/** Merges message lists by id, keeping chronological order. */
const mergeMessages = (...lists) => {
  const byId = new Map();
  lists.flat().forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default function RideChatScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const listRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;
    const socket = createSocket(token);
    socketRef.current = socket;

    ridesApi
      .messages(id)
      .then((history) => active && setMessages((current) => mergeMessages(history, current)))
      .catch((err) => active && Alert.alert('Chat unavailable', getErrorMessage(err)));

    socket.on('connect', () =>
      socket.emit('join_ride_chat', { rideId: id }, (res) => active && setConnected(Boolean(res?.ok))),
    );
    socket.on('disconnect', () => active && setConnected(false));
    socket.on('new_message', (message) => {
      if (active && message.rideId === id) setMessages((current) => mergeMessages(current, [message]));
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [id, token]);

  const send = () => {
    const content = text.trim();
    if (!content) return;
    socketRef.current?.emit('send_message', { rideId: id, content }, (res) => {
      if (!res?.ok) Alert.alert('Message not sent', res?.error ?? 'Please try again.');
    });
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <EmptyState icon="chatbubbles-outline" title="No messages yet" message="Say hi and agree on a pickup point." />
        }
        renderItem={({ item }) => {
          const mine = item.sender.id === user.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {!mine && <Text style={styles.sender}>{item.sender.name}</Text>}
              <Text style={[styles.content, mine && styles.mineText]}>{item.content}</Text>
              <Text style={[styles.time, mine && styles.mineTime]}>{formatTime(item.createdAt)}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={connected ? 'Type a message' : 'Connecting…'}
          placeholderTextColor={colors.muted}
          maxLength={500}
          multiline
        />
        <Pressable onPress={send} disabled={!connected || !text.trim()} style={[styles.send, (!connected || !text.trim()) && styles.sendDisabled]}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: spacing.md, borderRadius: radius.lg, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  sender: { fontSize: 12, fontWeight: '700', color: colors.primary },
  content: { fontSize: 15, color: colors.text },
  mineText: { color: '#fff' },
  time: { fontSize: 11, color: colors.muted, alignSelf: 'flex-end' },
  mineTime: { color: 'rgba(255,255,255,0.75)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
});
