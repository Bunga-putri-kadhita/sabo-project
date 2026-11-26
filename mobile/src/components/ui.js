import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { colors, font, radius, radiusLg } from "../theme";
import { ORDER, STATUS } from "../utils/status";
import GearDial from "./GearDial";

const LOGO_WHITE = require("../assets/logo-white.png");
const LOGO_BLACK = require("../assets/logo-black.png");

export function Logo({ size = 36, dark = true, text = true }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      accessible
      accessibilityLabel="SABO"
    >
      <Image
        source={dark ? LOGO_WHITE : LOGO_BLACK}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {text ? (
        <Text
          style={{
            fontFamily: font.displayBlack,
            fontSize: size * 0.8,
            color: dark ? colors.white : colors.ink,
            letterSpacing: 0.5,
          }}
        >
          SABO<Text style={{ color: colors.amber }}>.</Text>
        </Text>
      ) : null}
    </View>
  );
}

export function GearMark({ size = 40 }) {
  return (
    <Image
      source={LOGO_WHITE}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="SABO"
    />
  );
}

// Layar tab dengan pita gelap di atas (judul + roda gigi) dan lembar terang melengkung di bawahnya.
// `tab` memberi ruang bawah untuk tab bar melayang. Tanpa `title`, layar dipakai polos (mode terang).
export function Screen({
  children,
  scroll = true,
  dark = false,
  padded = true,
  tab = false,
  onRefresh,
  refreshing = false,
  header,
  title,
  eyebrow,
  subtitle,
  band,
  footer,
}) {
  const refresh = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.amber}
      colors={[colors.amber]}
    />
  ) : undefined;

  if (title) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.night }}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refresh}
        >
          <View style={s.band}>
            <GearDial
              size={210}
              opacity={0.5}
              stroke={1.6}
              style={{ position: "absolute", right: -64, top: -48 }}
            />
            {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
            <Text
              accessibilityRole="header"
              style={s.bandTitle}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? <Text style={s.bandSub}>{subtitle}</Text> : null}
            {band}
          </View>
          <View style={[s.sheet, { paddingBottom: tab ? 128 : 32 }]}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const bg = dark ? colors.night : colors.ground;
  const inner = (
    <View
      style={[
        padded && { paddingHorizontal: 20 },
        { paddingTop: 16, paddingBottom: tab ? 128 : 32, flexGrow: 1 },
      ]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: bg }}
      edges={["top", "left", "right"]}
    >
      {header}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.amberDeep}
                  colors={[colors.amber]}
                />
              ) : undefined
            }
          >
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </KeyboardAvoidingView>
      {footer}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={s.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={s.headerTitle}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={s.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Card({ children, style, dark, onPress, accessibilityLabel }) {
  const base = [s.card, dark && s.cardDark, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        ...base,
        pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
  small,
  icon,
}) {
  const off = disabled || loading;
  const primary = variant === "primary";
  const danger = variant === "danger";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        small && { minHeight: 48, paddingHorizontal: 14 },
        primary && s.btnPrimary,
        variant === "ghost" && s.btnGhost,
        variant === "dark" && { backgroundColor: colors.night },
        danger && {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: "#FCA5A5",
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        off && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.night : colors.ink} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text
            style={[
              s.btnText,
              small && { fontSize: 14 },
              variant === "ghost" && { color: colors.ink },
              variant === "dark" && { color: colors.white },
              danger && { color: colors.danger },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, dark, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={[s.label, dark && { color: "#CBD5E1" }]}>{label}</Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        accessibilityLabel={label}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[
          s.input,
          focus && { borderColor: colors.amber },
          !!error && { borderColor: colors.danger },
        ]}
        {...props}
      />
      {!!error && (
        <Text style={[s.error, dark && { color: "#FCA5A5" }]}>{error}</Text>
      )}
    </View>
  );
}

// Pesan galat. Kalau `onRetry` diberikan, muncul tombol "Coba lagi".
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <View style={s.banner} accessibilityRole="alert">
      <Text style={s.bannerText}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={{ marginTop: 8, minHeight: 44, justifyContent: "center" }}
        >
          <Text
            style={{
              fontFamily: font.bodyBold,
              fontSize: 14,
              color: colors.danger,
              textDecorationLine: "underline",
            }}
          >
            Coba lagi
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Heading({ children, dark, style }) {
  return (
    <Text
      accessibilityRole="header"
      style={[s.h1, dark && { color: colors.white }, style]}
    >
      {children}
    </Text>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 24,
        marginBottom: 10,
      }}
    >
      <Text style={s.section} accessibilityRole="header">
        {children}
      </Text>
      {right}
    </View>
  );
}

export function StatusChip({ status }) {
  const st = STATUS[status] || STATUS.PENDING;
  return (
    <View style={[s.chip, { backgroundColor: st.bg }]}>
      <View style={[s.chipDot, { backgroundColor: st.dot }]} />
      <Text style={[s.chipText, { color: st.fg }]}>{st.label}</Text>
    </View>
  );
}

export function Pill({ label, fg = colors.muted, bg = "#EFEDE7" }) {
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// Empat tahap status: Menunggu, Disetujui, Diproses, Selesai.
export function Stepper({ status, dark }) {
  const idx = Math.max(0, ORDER.indexOf(status));
  const line = dark ? "#334155" : colors.line;
  return (
    <View
      accessible
      accessibilityLabel={`Tahap ${idx + 1} dari 4: ${STATUS[status]?.label}`}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {ORDER.map((k, i) => {
          const done = i < idx;
          const now = i === idx;
          return (
            <View
              key={k}
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: i === ORDER.length - 1 ? 0 : 1,
              }}
            >
              <View
                style={{
                  width: now ? 20 : 12,
                  height: now ? 20 : 12,
                  borderRadius: 10,
                  backgroundColor: done || now ? colors.amber : "transparent",
                  borderWidth: done || now ? 0 : 2,
                  borderColor: line,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {now ? (
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: colors.night,
                    }}
                  />
                ) : null}
              </View>
              {i < ORDER.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: done ? colors.amber : line,
                    marginHorizontal: 4,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {ORDER.map((k, i) => (
          <Text
            key={k}
            style={{
              fontFamily: i === idx ? font.bodyBold : font.bodyMedium,
              fontSize: 11,
              color:
                i === idx
                  ? dark
                    ? colors.white
                    : colors.ink
                  : dark
                    ? "#A9B4C7"
                    : "#6B7280",
            }}
          >
            {STATUS[k].label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function Empty({ title, text, action }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Image
          source={LOGO_WHITE}
          style={{ width: 34, height: 34 }}
          resizeMode="contain"
        />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
      {action ? (
        <View style={{ marginTop: 16, alignSelf: "stretch" }}>{action}</View>
      ) : null}
    </View>
  );
}

export function Skeleton({ h = 88, style }) {
  const v = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [v]);
  return (
    <Animated.View
      style={[
        {
          height: h,
          borderRadius: radiusLg,
          backgroundColor: "#E9E7E0",
          opacity: v,
          marginBottom: 12,
        },
        style,
      ]}
    />
  );
}

export function Row({ label, value, mono, strong }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text
        style={[
          s.rowValue,
          mono && { fontFamily: font.monoMedium, fontSize: 13 },
          strong && { fontFamily: font.bodyBold },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// Lembar bawah (bottom sheet). Dipakai untuk form, pilihan, dan konfirmasi.
export function Sheet({ visible, onClose, title, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(15,23,42,0.55)" },
          ]}
          onPress={onClose}
          accessibilityLabel="Tutup"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SafeAreaView edges={["bottom"]} style={s.sheetModal}>
            <View style={s.handle} />
            {title ? (
              <Text style={s.sheetTitle} accessibilityRole="header">
                {title}
              </Text>
            ) : null}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 560 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                {children}
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function ConfirmSheet({
  visible,
  onClose,
  title,
  text,
  confirmLabel,
  onConfirm,
  loading,
  danger = true,
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {text ? (
        <Text
          style={{
            fontFamily: font.body,
            fontSize: 15,
            color: colors.muted,
            marginBottom: 20,
            lineHeight: 22,
          }}
        >
          {text}
        </Text>
      ) : null}
      <Button
        title={confirmLabel}
        variant={danger ? "danger" : "primary"}
        onPress={onConfirm}
        loading={loading}
      />
      <Button
        title="Batal"
        variant="ghost"
        onPress={onClose}
        style={{ marginTop: 10 }}
      />
    </Sheet>
  );
}

const s = StyleSheet.create({
  band: {
    backgroundColor: colors.night,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 44,
    overflow: "hidden",
  },
  eyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.amber,
    textTransform: "uppercase",
  },
  bandTitle: {
    fontFamily: font.displayBlack,
    fontSize: 52,
    lineHeight: 54,
    color: colors.white,
    textTransform: "uppercase",
    marginTop: 2,
  },
  bandSub: {
    fontFamily: font.body,
    fontSize: 14,
    color: "#AEB9CC",
    marginTop: 6,
    maxWidth: 210,
    lineHeight: 20,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.ground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: font.bodyBold, fontSize: 18, color: colors.ink },
  headerSub: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  cardDark: { backgroundColor: colors.night, borderColor: "#1E293B" },
  btn: {
    minHeight: 54,
    borderRadius: radius,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btnPrimary: { backgroundColor: colors.amber },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  btnText: { fontFamily: font.bodyBold, fontSize: 16, color: colors.night },
  label: {
    fontFamily: font.bodySemi,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  banner: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: radius,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.danger,
  },
  h1: {
    fontFamily: font.displayBlack,
    fontSize: 44,
    lineHeight: 44,
    color: colors.ink,
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  section: {
    fontFamily: font.bodyBold,
    fontSize: 13,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: font.bodySemi, fontSize: 12 },
  empty: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 12 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: font.bodyBold,
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 16,
  },
  rowLabel: { fontFamily: font.bodyMedium, fontSize: 14, color: colors.muted },
  rowValue: {
    fontFamily: font.bodySemi,
    fontSize: 14,
    color: colors.ink,
    flexShrink: 1,
    textAlign: "right",
  },
  sheetModal: {
    backgroundColor: colors.ground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  sheetTitle: {
    fontFamily: font.displayBlack,
    fontSize: 26,
    color: colors.ink,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
