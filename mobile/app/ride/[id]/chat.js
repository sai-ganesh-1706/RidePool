import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getErrorMessage } from '../../../src/api/client';
import { ridesApi } from '../../../src/api/rides';
import { createSocket } from '../../../src/api/socket';
import KeyboardSafeView from '../../../src/components/KeyboardSafeView';
import { EmptyState } from '../../../src/components/StateViews';
import { useAuth } from '../../../src/context/AuthContext';
import { radius, spacing, useThemedStyles } from '../../../src/theme';
import { formatTime } from '../../../src/utils/format';

/** Merges message lists by id, keeping chronological order. */
const mergeMessages = (...lists) => {
  const byId = new Map();
  lists.flat().forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default function RideChatScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
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

  const scrollToEnd = useCallback((animated = true) => listRef.current?.scrollToEnd({ animated }), []);

  // Keep the newest message visible when the keyboard opens.
  const onKeyboardChange = useCallback(({ visible }) => visible && setTimeout(scrollToEnd, 50), [scrollToEnd]);

  /** The message appears instantly (greyed) and is confirmed by the server's acknowledgement. */
  const send = () => {
    const content = text.trim();
    if (!content || !connected) return;

    const tempId = `pending-${Date.now()}`;
    const pending = {
      id: tempId,
      rideId: id,
      content,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
      pending: true,
    };
    setMessages((current) => mergeMessages(current, [pending]));
    setText('');

    socketRef.current?.timeout(10000).emit('send_message', { rideId: id, content }, (timedOut, res) => {
      const ok = !timedOut && res?.ok;
      setMessages((current) => {
        const withoutPending = current.filter((message) => message.id !== tempId);
        return ok && res.data ? mergeMessages(withoutPending, [res.data]) : withoutPending;
      });
      if (!ok) {
        setText((draft) => draft || content);
        Alert.alert('Message not sent', res?.error ?? 'Please check your connection and try again.');
      }
    });
  };

  const canSend = connected && text.trim().length > 0;

  return (
    <KeyboardSafeView style={styles.container} onKeyboardChange={onKeyboardChange}>
      <FlatList
        ref={listRef}
        style={styles.listWrap}
        data={messages}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollToEnd()}
        ListEmptyComponent={
          <EmptyState icon="chatbubbles-outline" title="No messages yet" message="Say hi and agree on a pickup point." />
        }
        renderItem={({ item }) => {
          const mine = item.sender.id === user.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs, item.pending && styles.pending]}>
              {!mine && <Text style={styles.sender}>{item.sender.name}</Text>}
              <Text style={[styles.content, mine && styles.mineText]}>{item.content}</Text>
              <Text style={[styles.time, mine && styles.mineTime]}>{item.pending ? 'Sending…' : formatTime(item.createdAt)}</Text>
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
          placeholderTextColor={colors.faint}
          maxLength={500}
          multiline
        />
        <Pressable onPress={send} disabled={!canSend} style={[styles.send, !canSend && styles.sendDisabled]}>
          <Ionicons name="send" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardSafeView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  // The container is white so the input bar's background continues under the system navigation bar.
  container: { backgroundColor: colors.card },
  listWrap: { backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  bubble: { maxWidth: '80%', paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.lg, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  pending: { opacity: 0.6 },
  sender: { fontSize: 12, fontWeight: '700', color: colors.primaryText },
  content: { fontSize: 15, color: colors.text, lineHeight: 21 },
  mineText: { color: colors.onPrimary },
  time: { fontSize: 11, color: colors.muted, alignSelf: 'flex-end' },
  mineTime: { color: colors.onPrimary, opacity: 0.7 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: colors.bg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: colors.text,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.35 },
});
