import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeftRight,
  Bell,
  Calendar,
  Check,
  Clock,
  Coffee,
  FileText,
  Headphones,
  Navigation,
  PhoneCall,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Video,
  Wrench,
} from "lucide-react-native";
import { bookingApi, serviceApi, vehicleApi } from "../api/data";
import { useAuth } from "../auth/AuthContext";
import { ErrorBanner, FadeIn, Screen, Skeleton } from "../components/ui";
import useLoad from "../hooks/useLoad";
import { colors, font } from "../theme";
import { jamWIB, menit, rupiah } from "../utils/format";

const STAGES = ["Antrean", "Inspeksi", "Pengerjaan", "Selesai"];
const STATUS_TO_STAGE = { PENDING: 0, APPROVED: 1, DIPROSES: 2, SELESAI: 3 };

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refreshing, refresh } = useLoad(async () => {
    const [bookings, vehicles, services] = await Promise.all([
      bookingApi.list(),
      vehicleApi.list(),
      serviceApi.list(),
    ]);
    return { bookings, vehicles, services };
  });

  const fullName = user?.name || "Pelanggan SABO";
  const bookings = data?.bookings ?? [];
  const vehicles = data?.vehicles ?? [];
  const services = data?.services ?? [];

  const mainCar = vehicles[0];
  const active = bookings.find((b) => b.status !== "SELESAI");
  const activeCount = bookings.filter((b) => b.status !== "SELESAI").length;
  const stageIdx = active ? (STATUS_TO_STAGE[active.status] ?? 0) : 0;

  const openNewBooking = (preselectedService) =>
    navigation.navigate(
      "NewBooking",
      preselectedService ? { preselectedService } : undefined,
    );

  const openWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/6281200000000?text=Halo%20Service%20Advisor%20SABO,%20saya%20ingin%20konsultasi%20servis.",
    ).catch(() => {});
  };

  return (
    <Screen tab onRefresh={refresh} refreshing={refreshing} padded={false}>
      <View style={{ paddingHorizontal: 18 }}>
        {/* 1. TOP HEADER BAR */}
        <FadeIn>
          <View style={s.topBar}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View style={s.logoBox}>
                <Text style={s.logoLetter}>S</Text>
              </View>
              <View>
                <Text style={s.brandTitle}>SABO</Text>
                <Text style={s.brandSub}>BENGKEL ONLINE</Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Pressable
                onPress={() => navigation.navigate("Booking")}
                style={s.notifBtn}
                accessibilityLabel="Notifikasi"
              >
                <Bell size={20} color={colors.ink} strokeWidth={2} />
                {activeCount > 0 && <View style={s.notifDot} />}
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Profil")}
                style={s.avatarBtn}
                accessibilityLabel="Profil"
              >
                <Text style={s.avatarText}>
                  {fullName.charAt(0).toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </View>
        </FadeIn>

        {/* 2. GREETING & ACTIVE VEHICLE BAR */}
        <FadeIn delay={40}>
          <View style={s.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.greetingText} numberOfLines={1}>
                Halo, {fullName} 👋
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Vehicles")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 13 }}>🚗</Text>
                <Text style={s.carName}>
                  {mainCar
                    ? `${mainCar.merk} ${mainCar.tipe}`
                    : "Belum ada kendaraan"}
                </Text>
                {mainCar?.platNomor ? (
                  <View style={s.plateChip}>
                    <Text style={s.plateText}>{mainCar.platNomor}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <Pressable
              onPress={() => navigation.navigate("Vehicles")}
              style={s.switchBtn}
              accessibilityLabel="Kelola kendaraan"
            >
              <ArrowLeftRight size={16} color={colors.ink} />
            </Pressable>
          </View>
        </FadeIn>

        <ErrorBanner message={error} />

        {loading ? (
          <>
            <Skeleton h={195} />
            <Skeleton h={90} />
            <Skeleton h={210} />
          </>
        ) : (
          <>
            {/* 3. HERO BANNER GELAP */}
            <FadeIn delay={70}>
              <View style={s.heroCard}>
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}
                >
                  <View style={s.heroPill}>
                    <View style={s.greenDot} />
                    <Text style={s.heroPillText}>BUKA 08:00 - 17:00 WIB</Text>
                  </View>
                  <View style={s.heroPill}>
                    <Wrench size={11} color="#CBD5E1" />
                    <Text style={[s.heroPillText, { color: "#E2E8F0" }]}>
                      4/6 Stall Siap
                    </Text>
                  </View>
                </View>

                <Text style={s.heroTitle}>
                  Servis Berkala & Tune Up Tanpa Calo
                </Text>
                <Text style={s.heroDesc}>
                  Pemesanan transparan, pantau mekanik realtime via smartphone.
                  Datang langsung masuk lift stall.
                </Text>

                <Pressable
                  onPress={() => openNewBooking()}
                  style={({ pressed }) => [
                    s.heroBtn,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <Calendar size={18} color={colors.night} strokeWidth={2.3} />
                  <Text style={s.heroBtnText}>Pesan Servis Sekarang</Text>
                </Pressable>
              </View>
            </FadeIn>

            {/* 4. 4 SHORTCUT MENU */}
            <FadeIn delay={100}>
              <View style={s.quickGrid}>
                <Pressable onPress={() => openNewBooking()} style={s.quickItem}>
                  <View
                    style={[s.quickIconBox, { backgroundColor: "#FEF3C7" }]}
                  >
                    <Wrench size={20} color="#D97706" />
                  </View>
                  <Text style={s.quickLabel}>Booking{"\n"}Servis</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    active
                      ? navigation.navigate("BookingDetail", { id: active.id })
                      : navigation.navigate("Booking")
                  }
                  style={s.quickItem}
                >
                  <View
                    style={[s.quickIconBox, { backgroundColor: "#E0E7FF" }]}
                  >
                    <SearchCheck size={20} color="#2563EB" />
                    {activeCount > 0 && (
                      <View style={s.badgeCount}>
                        <Text style={s.badgeCountText}>{activeCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.quickLabel}>Lacak{"\n"}Servis</Text>
                </Pressable>

                <Pressable onPress={openWhatsApp} style={s.quickItem}>
                  <View
                    style={[s.quickIconBox, { backgroundColor: "#FEE2E2" }]}
                  >
                    <PhoneCall size={20} color="#DC2626" />
                  </View>
                  <Text style={s.quickLabel}>Darurat 24{"\n"}Jam</Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Booking")}
                  style={s.quickItem}
                >
                  <View
                    style={[s.quickIconBox, { backgroundColor: "#F1F5F9" }]}
                  >
                    <FileText size={20} color="#334155" />
                  </View>
                  <Text style={s.quickLabel}>Riwayat{"\n"}Nota</Text>
                </Pressable>
              </View>
            </FadeIn>

            {/* 5. SERVIS BERJALAN (LIVE BAY FEED) */}
            {active ? (
              <FadeIn delay={130}>
                <View style={s.sectionHead}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.amber,
                      }}
                    />
                    <Text style={s.sectionHeadTitle}>Servis Berjalan</Text>
                  </View>
                  <Text style={s.liveTag}>LIVE BAY FEED</Text>
                </View>

                <View style={s.liveCard}>
                  {/* Header kode booking + mobil + badge status */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <Text style={s.bookingCode}>{active.bookingCode}</Text>
                    <View style={s.carBadge}>
                      <Text style={s.carBadgeText}>
                        {active.vehicle?.tipe || active.vehicle?.merk}{" "}
                        {active.vehicle?.platNomor}
                      </Text>
                    </View>
                    <View style={s.statusBadge}>
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: "#2563EB",
                        }}
                      />
                      <Text style={s.statusBadgeText}>{active.status}</Text>
                    </View>
                  </View>

                  <Text style={s.serviceSummary} numberOfLines={1}>
                    {(active.bookingDetails ?? [])
                      .map((d) => d.service?.namaLayanan)
                      .filter(Boolean)
                      .join(" + ") || "Servis Berkala"}
                  </Text>

                  {/* 4 Stage Stepper dengan ikon bulat */}
                  <View style={s.stepperWrap}>
                    {STAGES.map((label, idx) => {
                      const done = idx < stageIdx;
                      const current = idx === stageIdx;
                      return (
                        <View
                          key={label}
                          style={{ flex: 1, alignItems: "center" }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "center",
                            }}
                          >
                            {idx > 0 && (
                              <View
                                style={[
                                  s.stepLine,
                                  {
                                    backgroundColor:
                                      done || current ? "#B45309" : "#E2E8F0",
                                  },
                                ]}
                              />
                            )}
                            <View
                              style={[
                                s.stepCircle,
                                done && {
                                  backgroundColor: "#92400E",
                                  borderColor: "#92400E",
                                },
                                current && {
                                  backgroundColor: colors.amber,
                                  borderColor: colors.amber,
                                },
                              ]}
                            >
                              {done ? (
                                <Check size={12} color="#FFF" strokeWidth={3} />
                              ) : current ? (
                                <RefreshCw
                                  size={12}
                                  color={colors.night}
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <View
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "#94A3B8",
                                  }}
                                />
                              )}
                            </View>
                            {idx < STAGES.length - 1 && (
                              <View
                                style={[
                                  s.stepLine,
                                  {
                                    backgroundColor: done
                                      ? "#B45309"
                                      : "#E2E8F0",
                                  },
                                ]}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              s.stepText,
                              (done || current) && {
                                color: "#92400E",
                                fontFamily: font.bodyBold,
                              },
                            ]}
                          >
                            {label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* 2 Kotak Info: Lokasi Stall & Mekanik Lead */}
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 14 }}
                  >
                    <View style={s.infoBox}>
                      <View style={s.infoIconBox}>
                        <Wrench size={14} color="#92400E" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.infoLabel}>LOKASI STALL</Text>
                        <Text style={s.infoVal} numberOfLines={1}>
                          Stall 03 (Hyd...)
                        </Text>
                      </View>
                    </View>

                    <View style={s.infoBox}>
                      <View style={s.infoIconBox}>
                        <ShieldCheck size={14} color="#92400E" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.infoLabel}>MEKANIK LEAD</Text>
                        <Text style={s.infoVal} numberOfLines={1}>
                          {active.mechanic?.namaMekanik || "Menunggu Assign"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Estimasi Waktu */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 12,
                    }}
                  >
                    <Clock size={13} color={colors.muted} />
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: 12,
                        color: colors.muted,
                      }}
                    >
                      Jadwal:{" "}
                      <Text
                        style={{ fontFamily: font.bodyBold, color: colors.ink }}
                      >
                        {active.bookingTime} WIB
                      </Text>
                      {active.createdAt
                        ? ` (dibuat ${jamWIB(active.createdAt)})`
                        : ""}
                    </Text>
                  </View>

                  {/* Tombol Pantau Detail / Kamera */}
                  <Pressable
                    onPress={() =>
                      navigation.navigate("BookingDetail", { id: active.id })
                    }
                    style={({ pressed }) => [
                      s.camBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Video size={15} color={colors.ink} />
                    <Text style={s.camBtnText}>
                      Pantau Detail & Pembayaran →
                    </Text>
                  </Pressable>
                </View>
              </FadeIn>
            ) : null}

            {/* 6. PAKET SERVIS TERPOPULER (HORIZONTAL SLIDER) */}
            <FadeIn delay={160}>
              <View style={[s.sectionHead, { marginTop: 6 }]}>
                <View>
                  <Text style={s.sectionHeadTitle}>
                    Paket Servis Terpopuler
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.body,
                      fontSize: 12,
                      color: colors.muted,
                    }}
                  >
                    Rekomendasi teknisi untuk performa optimal
                  </Text>
                </View>
                <Pressable onPress={() => navigation.navigate("Layanan")}>
                  <Text
                    style={{
                      fontFamily: font.bodyBold,
                      fontSize: 13,
                      color: colors.amberDeep,
                    }}
                  >
                    Semua ›
                  </Text>
                </Pressable>
              </View>
            </FadeIn>
          </>
        )}
      </View>

      {!loading && services.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 12,
            paddingBottom: 6,
          }}
        >
          {services.slice(0, 5).map((srv, idx) => (
            <View key={srv.id} style={s.promoCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={[
                    s.promoTag,
                    { backgroundColor: idx === 0 ? "#FEF3C7" : "#DBEAFE" },
                  ]}
                >
                  <Text
                    style={[
                      s.promoTagText,
                      { color: idx === 0 ? "#B45309" : "#1D4ED8" },
                    ]}
                  >
                    {idx === 0 ? "HEMAT 10% DP" : "FAST PIT"}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Clock size={11} color={colors.muted} />
                  <Text
                    style={{
                      fontFamily: font.mono,
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {menit(srv.estimasiMenit)}
                  </Text>
                </View>
              </View>

              <Text style={s.promoTitle} numberOfLines={1}>
                {srv.namaLayanan}
              </Text>
              <Text style={s.promoDesc} numberOfLines={2}>
                {srv.deskripsi ||
                  "Pengecekan menyeluruh dengan standar bengkel resmi SABO."}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 14,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: font.mono,
                      fontSize: 9,
                      color: colors.muted,
                      letterSpacing: 0.5,
                    }}
                  >
                    BIAYA PAKET
                  </Text>
                  <Text style={s.promoPrice}>{rupiah(srv.harga)}</Text>
                </View>
                <Pressable
                  onPress={() => openNewBooking(srv)}
                  style={({ pressed }) => [
                    s.pilihBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={s.pilihBtnText}>Pilih</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: 18, marginTop: 14 }}>
        {/* 7. KARTU BENGKEL RESMI MITRA SABO */}
        <View style={s.workshopCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
            }}
            style={s.workshopImg}
          />
          <View style={s.workshopBody}>
            <View style={{ flex: 1 }}>
              <Text style={s.workshopTitle}>Bengkel Resmi Mitra SABO</Text>
              <Text style={s.workshopSub}>
                Cabang Utama Cilandak, Jakarta Selatan
              </Text>
            </View>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  "https://maps.google.com/?q=Bengkel+Mobil",
                ).catch(() => {})
              }
              style={s.ruteBtn}
            >
              <Navigation size={13} color={colors.ink} />
              <Text style={s.ruteBtnText}>Rute</Text>
            </Pressable>
          </View>
        </View>

        {/* 8. STANDAR KEPERCAYAAN SABO */}
        <View style={s.trustCard}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={18} color="#92400E" />
            <Text style={s.trustHeader}>Standar Kepercayaan SABO</Text>
          </View>

          <View style={{ gap: 14 }}>
            <View style={s.trustRow}>
              <View style={[s.trustIcon, { backgroundColor: "#FEF3C7" }]}>
                <ShieldCheck size={16} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>100% Suku Cadang Orisinal</Text>
                <Text style={s.trustDesc}>
                  Garansi uang kembali bila ditemukan komponen rekondisi tanpa
                  persetujuan.
                </Text>
              </View>
            </View>

            <View style={s.trustRow}>
              <View style={[s.trustIcon, { backgroundColor: "#E0E7FF" }]}>
                <Clock size={16} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>
                  Garansi Servis 1.000 KM / 14 Hari
                </Text>
                <Text style={s.trustDesc}>
                  Keluhan sama setelah servis langsung ditangani prioritas tanpa
                  antre & tanpa biaya jasa tambahan.
                </Text>
              </View>
            </View>

            <View style={s.trustRow}>
              <View style={[s.trustIcon, { backgroundColor: "#F1F5F9" }]}>
                <Coffee size={16} color="#475569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>Lounge Nyaman & Kopi Gratis</Text>
                <Text style={s.trustDesc}>
                  Ruang tunggu AC dingin dengan high-speed WiFi, display monitor
                  cctv stall pengerjaan.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 9. BANNER KONSULTASI WHATSAPP */}
        <View style={s.consultCard}>
          <View style={s.consultIcon}>
            <Headphones size={20} color="#92400E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.consultTitle}>Butuh Konsultasi Kendaraan?</Text>
            <Text style={s.consultSub}>
              Service Advisor SABO siap via WhatsApp
            </Text>
          </View>
          <Pressable onPress={openWhatsApp} style={s.tanyaSaBtn}>
            <Text style={s.tanyaSaText}>Tanya{"\n"}SA</Text>
          </Pressable>
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
    marginBottom: 8,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EFE6",
    borderWidth: 1,
    borderColor: "#E6E2D8",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontFamily: font.bodyBold,
    fontSize: 16,
    color: colors.amberDeep,
  },
  brandTitle: {
    fontFamily: font.bodyBold,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontFamily: font.mono,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.amber,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.amber,
  },
  avatarText: { fontFamily: font.bodyBold, fontSize: 14, color: colors.amber },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greetingText: { fontFamily: font.bodyBold, fontSize: 21, color: colors.ink },
  carName: { fontFamily: font.bodyMedium, fontSize: 13, color: colors.muted },
  plateChip: {
    backgroundColor: "#EDEAE2",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#DCD7CB",
  },
  plateText: { fontFamily: font.monoMedium, fontSize: 11, color: colors.ink },
  switchBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EDEAE2",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#141B29",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  heroPillText: { fontFamily: font.monoMedium, fontSize: 10, color: "#34D399" },
  heroTitle: {
    fontFamily: font.bodyBold,
    fontSize: 19,
    color: "#FFFFFF",
    lineHeight: 25,
  },
  heroDesc: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: "#94A3B8",
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  heroBtn: {
    backgroundColor: colors.amber,
    borderRadius: 12,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroBtnText: { fontFamily: font.bodyBold, fontSize: 14, color: colors.night },

  quickGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  quickItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E2D8",
  },
  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontFamily: font.bodySemi,
    fontSize: 11,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 14,
  },
  badgeCount: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeCountText: {
    fontFamily: font.bodyBold,
    fontSize: 10,
    color: colors.night,
  },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeadTitle: {
    fontFamily: font.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  liveTag: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
  },

  liveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginBottom: 18,
  },
  bookingCode: {
    fontFamily: font.monoMedium,
    fontSize: 12,
    color: colors.ink,
    flexShrink: 1,
  },
  carBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  carBadgeText: { fontFamily: font.mono, fontSize: 10, color: "#334155" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: "#2563EB",
  },
  serviceSummary: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 6,
  },

  stepperWrap: {
    flexDirection: "row",
    backgroundColor: "#FAF8F5",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: { flex: 1, height: 2 },
  stepText: {
    fontFamily: font.bodyMedium,
    fontSize: 10,
    color: colors.muted,
    marginTop: 5,
  },

  infoBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FAF8F5",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontFamily: font.mono, fontSize: 9, color: colors.muted },
  infoVal: {
    fontFamily: font.bodyBold,
    fontSize: 12,
    color: colors.ink,
    marginTop: 1,
  },

  camBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F1EFEA",
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 12,
  },
  camBtnText: { fontFamily: font.bodySemi, fontSize: 12.5, color: colors.ink },

  promoCard: {
    width: 235,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E6E2D8",
  },
  promoTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  promoTagText: { fontFamily: font.monoMedium, fontSize: 9.5 },
  promoTitle: {
    fontFamily: font.bodyBold,
    fontSize: 15,
    color: colors.ink,
    marginTop: 10,
  },
  promoDesc: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 16,
  },
  promoPrice: {
    fontFamily: font.bodyBold,
    fontSize: 16,
    color: colors.ink,
    marginTop: 2,
  },
  pilihBtn: {
    backgroundColor: colors.amber,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
  },
  pilihBtnText: {
    fontFamily: font.bodyBold,
    fontSize: 12,
    color: colors.night,
  },

  workshopCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginBottom: 14,
  },
  workshopImg: { width: "100%", height: 125, backgroundColor: "#E2E8F0" },
  workshopBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 10,
  },
  workshopTitle: { fontFamily: font.bodyBold, fontSize: 15, color: colors.ink },
  workshopSub: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  ruteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3EFE6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ruteBtnText: { fontFamily: font.bodySemi, fontSize: 12, color: colors.ink },

  trustCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginBottom: 14,
  },
  trustHeader: { fontFamily: font.bodyBold, fontSize: 15, color: colors.ink },
  trustRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  trustTitle: { fontFamily: font.bodyBold, fontSize: 13, color: colors.ink },
  trustDesc: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },

  consultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3EFE6",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginBottom: 8,
  },
  consultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6DFD1",
    alignItems: "center",
    justifyContent: "center",
  },
  consultTitle: {
    fontFamily: font.bodyBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  consultSub: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
  },
  tanyaSaBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    alignItems: "center",
  },
  tanyaSaText: {
    fontFamily: font.bodyBold,
    fontSize: 11.5,
    color: colors.ink,
    textAlign: "center",
  },
});
