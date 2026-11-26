import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react-native";
import { useAuth } from "../auth/AuthContext";
import { errMsg } from "../api/client";
import { ErrorBanner, FadeIn, Screen } from "../components/ui";
import { colors, font } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Masukkan email dan kata sandi akun SABO Anda.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(
        errMsg(e, "Gagal masuk. Periksa kembali email dan kata sandi Anda."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={true} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* ARCHITECTURAL ATELIER HEADER */}
        <View style={s.hero}>
          <View style={s.heroTopRow}>
            <View style={s.brandMark}>
              <Wrench size={16} color={colors.night} strokeWidth={2.4} />
            </View>
            <View style={s.telemetryChip}>
              <View style={s.liveDot} />
              <Text style={s.telemetryText}>ATELIER CLIENT PORTAL</Text>
            </View>
          </View>

          <Text style={s.heroWordmark}>SABO</Text>
          <Text style={s.heroTagline}>
            SMART AUTO BOOKING & TELEMETRY GARAGE
          </Text>

          <View style={s.heroDivider} />

          <Text style={s.heroHeadline}>
            Kendali penuh perawatan & riwayat servis kendaraan Anda.
          </Text>
        </View>

        {/* FORM SHEET */}
        <View style={s.bodyWrap}>
          <FadeIn>
            <View style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formEyebrow}>• AUTENTIKASI MEMBER</Text>
                <Text style={s.formTitle}>Masuk ke Garasi</Text>
              </View>

              <ErrorBanner message={error} />

              {/* EMAIL INPUT */}
              <View style={s.inputGroup}>
                <Text style={s.label}>ALAMAT EMAIL</Text>
                <View
                  style={[
                    s.inputShell,
                    focusedField === "email" && s.inputShellFocused,
                  ]}
                >
                  <Mail
                    size={17}
                    color={
                      focusedField === "email" ? colors.amberDeep : colors.muted
                    }
                  />
                  <TextInput
                    style={s.input}
                    placeholder="nama@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* PASSWORD INPUT */}
              <View style={s.inputGroup}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <Text style={[s.label, { marginBottom: 0 }]}>KATA SANDI</Text>
                  <Text style={s.securityHint}>256-BIT ENCRYPTED</Text>
                </View>

                <View
                  style={[
                    s.inputShell,
                    focusedField === "password" && s.inputShellFocused,
                  ]}
                >
                  <Lock
                    size={17}
                    color={
                      focusedField === "password"
                        ? colors.amberDeep
                        : colors.muted
                    }
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPass}
                    value={password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPass((v) => !v)}
                    hitSlop={10}
                    style={s.eyeBtn}
                  >
                    {showPass ? (
                      <EyeOff size={17} color={colors.muted} />
                    ) : (
                      <Eye size={17} color={colors.muted} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* SUBMIT BUTTON */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  s.primaryBtn,
                  pressed &&
                    !loading && {
                      opacity: 0.92,
                      transform: [{ scale: 0.992 }],
                    },
                  loading && { opacity: 0.7 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.night} />
                ) : (
                  <>
                    <Text style={s.primaryBtnText}>Masuk ke Akun SABO</Text>
                    <View style={s.btnArrowBox}>
                      <ArrowRight
                        size={16}
                        color={colors.amber}
                        strokeWidth={2.5}
                      />
                    </View>
                  </>
                )}
              </Pressable>

              {/* TRUST STRIP */}
              <View style={s.trustStrip}>
                <ShieldCheck size={14} color={colors.amberDeep} />
                <Text style={s.trustText}>
                  Paspor Servis Digital • Estimasi Transparan • Pit Real-Time
                </Text>
              </View>
            </View>
          </FadeIn>

          {/* REGISTER SWITCHER CARD */}
          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={({ pressed }) => [
              s.switchCard,
              pressed && { backgroundColor: "#EFECE4" },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.switchEyebrow}>BELUM TERDAFTAR?</Text>
              <Text style={s.switchTitle}>Buat Paspor Member Baru</Text>
            </View>
            <View style={s.switchPill}>
              <Sparkles size={13} color={colors.amberDeep} />
              <Text style={s.switchPillText}>Daftar</Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: "#14181F",
    paddingTop: 28,
    paddingBottom: 38,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  telemetryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber,
  },
  telemetryText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: "#E2E8F0",
    letterSpacing: 1.1,
  },
  heroWordmark: {
    fontFamily: font.displayBlack,
    fontSize: 48,
    color: "#FFFFFF",
    letterSpacing: 2,
    lineHeight: 50,
  },
  heroTagline: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amber,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
  heroHeadline: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: "#CBD5E1",
    lineHeight: 20,
  },

  bodyWrap: {
    paddingHorizontal: 18,
    marginTop: -20,
    paddingBottom: 28,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E2DA",
    shadowColor: "#14181F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  formHeader: {
    marginBottom: 18,
  },
  formEyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amberDeep,
    letterSpacing: 1,
  },
  formTitle: {
    fontFamily: font.bodyBold,
    fontSize: 22,
    color: colors.ink,
    marginTop: 2,
  },

  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.ink,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  securityHint: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: colors.muted,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAF8F5",
    borderWidth: 1.2,
    borderColor: "#E2DFD7",
    borderRadius: 13,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputShellFocused: {
    borderColor: colors.amberDeep,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 14.5,
    color: colors.ink,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 4,
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.amber,
    borderRadius: 14,
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
    marginTop: 6,
  },
  primaryBtnText: {
    fontFamily: font.bodyBold,
    fontSize: 15,
    color: colors.night,
  },
  btnArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
  },

  trustStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1EFEA",
  },
  trustText: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
  },

  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3EE",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2DFD7",
  },
  switchEyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: colors.muted,
    letterSpacing: 0.8,
  },
  switchTitle: {
    fontFamily: font.bodyBold,
    fontSize: 14.5,
    color: colors.ink,
    marginTop: 2,
  },
  switchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  switchPillText: {
    fontFamily: font.bodyBold,
    fontSize: 12.5,
    color: colors.amberDeep,
  },
});
