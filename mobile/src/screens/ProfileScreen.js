import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  Award,
  Bell,
  Car,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  Fingerprint,
  Headphones,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react-native";
import { bookingApi, vehicleApi } from "../api/data";
import { useAuth } from "../auth/AuthContext";
import { FadeIn, Screen } from "../components/ui";
import useLoad from "../hooks/useLoad";
import { colors, font } from "../theme";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [biometricOn, setBiometricOn] = useState(true);

  const { data } = useLoad(async () => {
    const [bookings, vehicles] = await Promise.all([
      bookingApi.list(),
      vehicleApi.list(),
    ]);
    return { bookings, vehicles };
  });

  const fullName = user?.name || "Pelanggan SABO";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const completedCount = (data?.bookings ?? []).filter(
    (b) => b.status === "SELESAI",
  ).length;
  const vehicleCount = (data?.vehicles ?? []).length;
  const carSummary =
    (data?.vehicles ?? []).map((v) => `${v.merk} ${v.tipe}`).join(", ") ||
    "Belum ada unit terdaftar";

  function handleLogout() {
    Alert.alert(
      "Keluar dari Akun",
      "Yakin ingin keluar dari sesi SABO Atelier?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: logout },
      ],
    );
  }

  return (
    <Screen tab padded={false}>
      <View style={{ paddingHorizontal: 18 }}>
        {/* TOP BAR SABO ATELIER */}
        <View style={s.topBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={s.atelierIcon}>
              <CarFront size={18} color={colors.amberDeep} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={s.atelierEyebrow}>SABO ATELIER</Text>
              <Text style={s.atelierTitle}>Profil</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => navigation.navigate("Booking")}
              style={s.bellBtn}
            >
              <Bell size={19} color={colors.ink} />
            </Pressable>
            <View style={s.profileCircle}>
              <User size={17} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* 1. KARTU VIP MEMBER */}
        <FadeIn>
          <View style={s.vipCard}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View style={s.avatarLg}>
                <Text style={s.avatarLgText}>{initials || "SB"}</Text>
                <View style={s.verifiedBadge}>
                  <CheckCircle2
                    size={14}
                    color={colors.night}
                    fill={colors.amber}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.userName} numberOfLines={1}>
                  {fullName}
                </Text>
                <Text style={s.userContact} numberOfLines={1}>
                  {user?.phone || "+62 812-3456-7890"} •{" "}
                  {user?.email || "member@sabo.id"}
                </Text>

                <View style={s.vipPill}>
                  <Award size={12} color={colors.amberDeep} />
                  <Text style={s.vipPillText}>
                    SABO VIP Concierge #SAB-8821
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() =>
                Linking.openURL("https://wa.me/6281200000000").catch(() => {})
              }
              style={s.assistantBar}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: colors.amber,
                  }}
                />
                <Text style={s.assistantLabel}>
                  Layanan Asisten Pribadi:{" "}
                  <Text
                    style={{ fontFamily: font.bodyBold, color: colors.ink }}
                  >
                    Aktif Siaga
                  </Text>
                </Text>
              </View>
              <Text style={s.assistantLink}>Hubungi →</Text>
            </Pressable>
          </View>
        </FadeIn>

        {/* 2. 3 KOTAK STATISTIK */}
        <FadeIn delay={50}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            <View style={s.statCard}>
              <Text style={s.statTop}>SERVIS{"\n"}SELESAI</Text>
              <Text style={s.statNum}>
                {completedCount}{" "}
                <Text style={[s.statUnit, { color: colors.amberDeep }]}>
                  kali
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <CheckCircle2 size={11} color={colors.amberDeep} />
                <Text style={[s.statFoot, { color: colors.amberDeep }]}>
                  Buku Beres
                </Text>
              </View>
            </View>

            <View style={s.statCard}>
              <Text style={s.statTop}>GARASI{"\n"}AKTIF</Text>
              <Text style={s.statNum}>
                {vehicleCount} <Text style={s.statUnit}>unit</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <Car size={11} color="#2563EB" />
                <Text style={[s.statFoot, { color: "#2563EB" }]}>
                  Terdaftar
                </Text>
              </View>
            </View>

            <View style={s.statCard}>
              <Text style={s.statTop}>PRESISI{"\n"}MESIN</Text>
              <Text style={[s.statNum, { color: colors.amberDeep }]}>100%</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <Zap size={11} color={colors.amberDeep} />
                <Text style={[s.statFoot, { color: colors.amberDeep }]}>
                  Optimal
                </Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* 3. PREFERENSI KENDARAAN & SERVIS */}
        <Text style={s.groupHeader}>PREFERENSI KENDARAAN & SERVIS</Text>
        <View style={s.menuGroup}>
          <Pressable
            onPress={() => navigation.navigate("Kendaraan")}
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <Car size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Garasi & Spesifikasi Mobil</Text>
              <Text style={s.menuSub} numberOfLines={1}>
                {carSummary}
              </Text>
            </View>
            <View style={s.grayChip}>
              <Text style={s.grayChipText}>{vehicleCount} Mobil</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>

          <View style={s.divider} />

          <Pressable
            onPress={() => navigation.navigate("Booking")}
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <ShieldCheck size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Paspor Servis & Riwayat E-SPK</Text>
              <Text style={s.menuSub}>
                Arsip berkas teknis, PDF inspeksi & kuitansi
              </Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>

          <View style={s.divider} />

          <Pressable
            onPress={() =>
              Alert.alert(
                "Notifikasi Aktif",
                "Laporan servis dikirim via WhatsApp & Push Notification.",
              )
            }
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <Bell size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle} numberOfLines={1}>
                Langganan Notifikasi
              </Text>
              <Text style={s.menuSub} numberOfLines={1}>
                Laporan oli, suhu & pengingat servis
              </Text>
            </View>
            <View style={s.blueChip}>
              <Text style={s.blueChipText}>WhatsApp & Push</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* 4. PEMBAYARAN & LEGALITAS */}
        <Text style={s.groupHeader}>PEMBAYARAN & LEGALITAS</Text>
        <View style={s.menuGroup}>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Metode Pembayaran",
                "QRIS Instant & Virtual Account aktif untuk pembayaran DP.",
              )
            }
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <CreditCard size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Metode Pembayaran Tersimpan</Text>
              <Text style={s.menuSub}>
                BCA Prioritas •••• 8812, QRIS Instant
              </Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>

          <View style={s.divider} />

          <Pressable
            onPress={() => navigation.navigate("Booking")}
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <FileSpreadsheet size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Faktur Pajak & E-Invoice</Text>
              <Text style={s.menuSub}>Bukti transaksi resmi SABO Atelier</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* 5. KEAMANAN & LAYANAN KHUSUS */}
        <Text style={s.groupHeader}>KEAMANAN & LAYANAN KHUSUS</Text>
        <View style={s.menuGroup}>
          <View style={s.menuRow}>
            <View style={s.menuIconBox}>
              <Fingerprint size={17} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Kunci Biometrik & Face ID</Text>
              <Text style={s.menuSub}>
                Aman untuk otorisasi persetujuan biaya
              </Text>
            </View>
            <Switch
              value={biometricOn}
              onValueChange={setBiometricOn}
              trackColor={{ false: "#CBD5E1", true: colors.amber }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={s.divider} />

          <Pressable
            onPress={() =>
              Alert.alert(
                "Keamanan Akun",
                "Fitur ubah kata sandi terhubung ke verifikasi email terdaftar.",
              )
            }
            style={s.menuRow}
          >
            <View style={s.menuIconBox}>
              <KeyRound size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Ubah Kata Sandi Akun</Text>
              <Text style={s.menuSub}>Terakhir diperbarui 45 hari lalu</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>

          <View style={s.divider} />

          <Pressable
            onPress={() =>
              Linking.openURL("https://wa.me/6281200000000").catch(() => {})
            }
            style={s.menuRow}
          >
            <View style={[s.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Headphones size={17} color={colors.amberDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuTitle}>Dukungan Concierge 24/7</Text>
              <Text style={s.menuSub}>
                Terhubung ke Master Advisor (Bpk. Aris)
              </Text>
            </View>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: colors.amber,
              }}
            />
            <ChevronRight size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* TOMBOL KELUAR DARI AKUN */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.85 }]}
        >
          <LogOut size={16} color={colors.danger} />
          <Text style={s.logoutText}>Keluar dari Akun</Text>
        </Pressable>

        {/* FOOTER ISO */}
        <View style={{ alignItems: "center", marginTop: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Lock size={11} color={colors.muted} />
            <Text style={s.footerMono}>
              SABO Luxury Atelier Mobile • v3.4.2
            </Text>
          </View>
          <Text style={s.footerSub}>
            Enkripsi End-to-End Berstandar Otomotif ISO/IEC 27001
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 10,
  },
  atelierIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFECE4",
    borderWidth: 1,
    borderColor: "#E2DFD7",
    alignItems: "center",
    justifyContent: "center",
  },
  atelierEyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: colors.amberDeep,
    letterSpacing: 1.4,
  },
  atelierTitle: { fontFamily: font.bodyBold, fontSize: 16, color: colors.ink },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#78350F",
    alignItems: "center",
    justifyContent: "center",
  },

  vipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 14,
  },
  avatarLg: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#78716C",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLgText: {
    fontFamily: font.bodyBold,
    fontSize: 22,
    color: colors.amber,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 1,
  },
  userName: { fontFamily: font.bodyBold, fontSize: 18, color: colors.ink },
  userContact: {
    fontFamily: font.mono,
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 2,
  },
  vipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 7,
  },
  vipPillText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: colors.amberDeep,
  },

  assistantBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAF8F5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  assistantLabel: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
  },
  assistantLink: {
    fontFamily: font.bodyBold,
    fontSize: 11.5,
    color: colors.amberDeep,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E5E0",
  },
  statTop: {
    fontFamily: font.mono,
    fontSize: 9,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 12,
  },
  statNum: {
    fontFamily: font.bodyBold,
    fontSize: 19,
    color: colors.ink,
    marginTop: 5,
  },
  statUnit: { fontFamily: font.body, fontSize: 12, color: colors.muted },
  statFoot: { fontFamily: font.monoMedium, fontSize: 9.5 },

  groupHeader: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amberDeep,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 16,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { fontFamily: font.bodyBold, fontSize: 13.5, color: colors.ink },
  menuSub: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: "#F1EFEA", marginLeft: 60 },

  grayChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  grayChipText: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.ink,
  },
  blueChip: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  blueChipText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: "#1D4ED8",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: { fontFamily: font.bodyBold, fontSize: 14, color: colors.danger },

  footerMono: { fontFamily: font.mono, fontSize: 10.5, color: colors.ink },
  footerSub: {
    fontFamily: font.body,
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
});
