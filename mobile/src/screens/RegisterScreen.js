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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { useAuth } from "../auth/AuthContext";
import { errMsg } from "../api/client";
import { ErrorBanner, FadeIn, Screen } from "../components/ui";
import { colors, font } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setError("Nama lengkap, email, dan kata sandi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter demi keamanan akun Anda.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
    } catch (e) {
      setError(errMsg(e, "Gagal melakukan registrasi. Silakan coba lagi."));
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
        {/* TOP DARK HEADER */}
        <View style={s.hero}>
          <View style={s.topNav}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={s.backBtn}
              hitSlop={10}
            >
              <ArrowLeft size={18} color="#FFFFFF" />
            </Pressable>
            <Text style={s.stepBadge}>MEMBERSHIP • SABO VAULT</Text>
          </View>

          <Text style={s.heroTitle}>Registrasi Member</Text>
          <Text style={s.heroSub}>
            Daftarkan akun untuk akses booking prioritas, log servis digital,
            dan notifikasi real-time pengerjaan unit.
          </Text>

          {/* BENEFIT PILLS */}
          <View style={s.benefitRow}>
            <View style={s.benefitItem}>
              <CheckCircle2 size={13} color={colors.amber} />
              <Text style={s.benefitText}>Multi-Kendaraan</Text>
            </View>
            <View style={s.benefitItem}>
              <CheckCircle2 size={13} color={colors.amber} />
              <Text style={s.benefitText}>Harga Transparan</Text>
            </View>
          </View>
        </View>

        {/* FORM CONTAINER */}
        <View style={s.bodyWrap}>
          <FadeIn>
            <View style={s.formCard}>
              <ErrorBanner message={error} />

              {/* NAMA LENGKAP */}
              <View style={s.inputGroup}>
                <Text style={s.label}>NAMA LENGKAP *</Text>
                <View
                  style={[
                    s.inputShell,
                    focusedField === "name" && s.inputShellFocused,
                  ]}
                >
                  <User
                    size={17}
                    color={
                      focusedField === "name" ? colors.amberDeep : colors.muted
                    }
                  />
                  <TextInput
                    style={s.input}
                    placeholder="Contoh: Budi Wijaya"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    value={name}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View style={s.inputGroup}>
                <Text style={s.label}>ALAMAT EMAIL *</Text>
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
                    placeholder="budi@email.com"
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

              {/* NOMOR WHATSAPP */}
              <View style={s.inputGroup}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <Text style={[s.label, { marginBottom: 0 }]}>
                    NOMOR WHATSAPP
                  </Text>
                  <Text style={s.optionalTag}>NOTIFIKASI SERVIS</Text>
                </View>
                <View
                  style={[
                    s.inputShell,
                    focusedField === "phone" && s.inputShellFocused,
                  ]}
                >
                  <Phone
                    size={17}
                    color={
                      focusedField === "phone" ? colors.amberDeep : colors.muted
                    }
                  />
                  <TextInput
                    style={s.input}
                    placeholder="0812 3456 7890"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phone}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={s.inputGroup}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <Text style={[s.label, { marginBottom: 0 }]}>
                    KATA SANDI *
                  </Text>
                  <Text style={s.optionalTag}>MIN. 6 KARAKTER</Text>
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
                    placeholder="Buat kata sandi akun"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPass}
                    value={password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPassword}
                    onSubmitEditing={handleRegister}
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

              {/* SUBMIT */}
              <Pressable
                onPress={handleRegister}
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
                    <Text style={s.primaryBtnText}>Aktifkan Akun Member</Text>
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

              <View style={s.privacyNote}>
                <ShieldCheck size={14} color={colors.amberDeep} />
                <Text style={s.privacyText}>
                  Data kendaraan & kontak dilindungi dalam SABO Atelier Vault.
                </Text>
              </View>
            </View>
          </FadeIn>

          {/* LOGIN SWITCHER */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [s.switchRow, pressed && { opacity: 0.75 }]}
          >
            <Text style={s.switchText}>
              Sudah memiliki akun SABO?{" "}
              <Text style={s.switchLink}>Masuk sekarang</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: "#14181F",
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadge: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amber,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: font.displayBold,
    fontSize: 34,
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  heroSub: {
    fontFamily: font.body,
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 19,
    marginTop: 6,
  },
  benefitRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  benefitText: {
    fontFamily: font.mono,
    fontSize: 10,
    color: "#E2E8F0",
  },

  bodyWrap: {
    paddingHorizontal: 18,
    marginTop: -18,
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

  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.ink,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  optionalTag: {
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
    minHeight: 48,
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
    paddingVertical: 11,
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

  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1EFEA",
  },
  privacyText: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
  },

  switchRow: {
    alignItems: "center",
    paddingVertical: 16,
  },
  switchText: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  switchLink: {
    fontFamily: font.bodyBold,
    color: colors.amberDeep,
  },
});
