import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Send } from "lucide-react-native";
import { chatApi } from "../api/data";
import { errMsg } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Empty, ErrorBanner, ScreenHeader } from "../components/ui";
import { colors, font } from "../theme";
import { jamWIB } from "../utils/format";

export default function ChatScreen({ navigation, route }) {
  const { bookingId, code } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setMessages(await chatApi.list(bookingId));
    } catch (e) {
      setError(errMsg(e, "Gagal memuat chat."));
      setMessages((p) => p ?? []);
    }
  }, [bookingId]);

  // Muat ulang tiap 5 detik selama layar aktif.
  useFocusEffect(
    useCallback(() => {
      load();
      const t = setInterval(load, 5000);
      return () => clearInterval(t);
    }, [load]),
  );

  useEffect(() => {
    if (messages?.length)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages?.length]);

  async function send() {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setError("");
    try {
      const m = await chatApi.send(bookingId, msg);
      setText("");
      setMessages((p) => [...(p ?? []), m]);
    } catch (e) {
      setError(errMsg(e, "Pesan gagal terkirim."));
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.ground }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeader
        title="Chat bengkel"
        subtitle={code}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <ErrorBanner message={error} />
        </View>
        <FlatList
          ref={listRef}
          data={messages ?? []}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            messages ? (
              <Empty
                title="Belum ada pesan"
                text="Tanyakan apa saja soal booking ini. Admin bengkel akan membalas."
              />
            ) : null
          }
          renderItem={({ item: m }) => {
            const mine = m.senderId === user?.id;
            return (
              <View
                style={{
                  alignItems: mine ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    maxWidth: "82%",
                    backgroundColor: mine ? colors.night : colors.card,
                    borderRadius: 18,
                    borderBottomRightRadius: mine ? 4 : 18,
                    borderBottomLeftRadius: mine ? 18 : 4,
                    borderWidth: mine ? 0 : 1,
                    borderColor: colors.line,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  {!mine ? (
                    <Text
                      style={{
                        fontFamily: font.bodyBold,
                        fontSize: 12,
                        color: colors.amberDeep,
                        marginBottom: 2,
                      }}
                    >
                      {m.sender?.name || "Bengkel"}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      fontFamily: font.body,
                      fontSize: 15,
                      color: mine ? colors.white : colors.ink,
                      lineHeight: 21,
                    }}
                  >
                    {m.message}
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.mono,
                      fontSize: 10,
                      color: mine ? "#AEB9CC" : colors.muted,
                      marginTop: 4,
                      alignSelf: "flex-end",
                    }}
                  >
                    {jamWIB(m.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            backgroundColor: colors.ground,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tulis pesan..."
            placeholderTextColor="#94A3B8"
            accessibilityLabel="Tulis pesan"
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              minHeight: 48,
              maxHeight: 110,
              backgroundColor: colors.card,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: colors.line,
              paddingHorizontal: 16,
              paddingTop: 13,
              paddingBottom: 13,
              fontFamily: font.body,
              fontSize: 15,
              color: colors.ink,
            }}
          />
          <Pressable
            onPress={send}
            disabled={!text.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Kirim pesan"
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.amber,
              alignItems: "center",
              justifyContent: "center",
              opacity: !text.trim() || sending ? 0.6 : 1,
            }}
          >
            <Send size={19} color={colors.night} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
