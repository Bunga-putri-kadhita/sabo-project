import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Bell,
  Calendar,
  CarFront,
  CheckCircle2,
  Clock,
  Cloud,
  FileText,
  Headphones,
  MessageSquare,
  Radio,
  ShieldCheck,
  User,
  Users,
  Video,
  Wrench,
} from "lucide-react-native";
import { bookingApi } from "../api/data";
import {
  Button,
  Empty,
  ErrorBanner,
  FadeIn,
  Screen,
  Skeleton,
} from "../components/ui";
import useLoad from "../hooks/useLoad";
import { colors, font } from "../theme";
import { rupiah, tanggalID } from "../utils/format";

const PIT_STEPS = ["Scan", "Laser", "Torsi Baut", "Uji Jalan"];
const STATUS_STEP = { PENDING: 1, APPROVED: 2, DIPROSES: 3, SELESAI: 4 };
const STATUS_PCT = { PENDING: 25, APPROVED: 50, DIPROSES: 78, SELESAI: 100 };

export default function BookingsScreen({ navigation }) {
  const {
    data: bookings,
    loading,
    error,
    refreshing,
    refresh,
  } = useLoad(bookingApi.list);
  const [tab, setTab] = useState("Berjalan");

  const all = bookings ?? [];
  const running = all.filter(
    (b) => b.status === "DIPROSES" || b.status === "APPROVED",
  );
  const upcoming = all.filter((b) => b.status === "PENDING");
  const history = all.filter((b) => b.status === "SELESAI");

  const activeUnit = running[0] || upcoming[0];
  const listByTab =
    tab === "Berjalan" ? running : tab === "Mendatang" ? upcoming : history;

  return (
    <Screen tab onRefresh={refresh} refreshing={refreshing} padded={false}>
      <View style={{ paddingHorizontal: 18 }}>
        {/* TOP BAR SABO ATELIER */}
        <View style={s.topBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={s.atelierIcon}>
              <CarFront size={18} color={colors.amberDeep} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={s.atelierEyebrow}>SABO ATELIER</Text>
              <Text style={s.atelierTitle}>Booking</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => navigation.navigate("Booking")}
              style={s.bellBtn}
            >
              <Bell size={19} color={colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Profil")}
              style={s.profileCircle}
            >
              <User size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* HEADER + PIT LIVE SYNC */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.hubEyebrow}>ATELIER SERVICE HUB</Text>
            <Text style={s.pageTitle}>Reservasi & Servis</Text>
          </View>
          <View style={s.liveSyncPill}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.amberDeep,
              }}
            />
            <Text style={s.liveSyncText}>Pit Live Sync</Text>
          </View>
        </View>
        <Text style={s.subtitle}>
          Jadwal pit stall dan pemantauan telemetri aktif pengerjaan unit Anda.
        </Text>

        {/* 3 SEGMENTED TABS */}
        <View style={s.segmentWrap}>
          {[
            { key: "Berjalan", count: running.length },
            { key: "Mendatang", count: upcoming.length },
            { key: "Riwayat", count: history.length },
          ].map((item) => {
            const on = tab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={[s.segBtn, on && s.segBtnOn]}
              >
                <Text
                  style={[
                    s.segText,
                    on && { color: "#FFFFFF", fontFamily: font.bodyBold },
                  ]}
                >
                  {item.key}
                </Text>
                {item.count > 0 && (
                  <View
                    style={[
                      s.segBadge,
                      on
                        ? { backgroundColor: colors.amber }
                        : { backgroundColor: "#E2E8F0" },
                    ]}
                  >
                    <Text
                      style={[
                        s.segBadgeText,
                        on ? { color: colors.night } : { color: colors.muted },
                      ]}
                    >
                      {item.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <ErrorBanner message={error} />

        {loading ? (
          <>
            <Skeleton h={270} />
            <Skeleton h={200} />
          </>
        ) : (
          <>
            {/* UNIT DALAM PENGERJAAN (KARTU GELAP) */}
            {tab === "Berjalan" && activeUnit && (
              <FadeIn>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Wrench size={13} color={colors.amberDeep} />
                    <Text style={s.unitSectionLabel}>
                      UNIT DALAM PENGERJAAN
                    </Text>
                  </View>
                  <Text style={s.unitIdMono}>
                    ID: #{activeUnit.bookingCode}
                  </Text>
                </View>

                <View style={s.darkPitCard}>
                  {/* Top Pill */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={s.liveStallBadge}>
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: "#10B981",
                        }}
                      />
                      <Text style={s.liveStallText}>LIVE DI PIT STALL #03</Text>
                    </View>
                    <View style={s.signalIcon}>
                      <Radio size={14} color="#CBD5E1" />
                    </View>
                  </View>

                  {/* Mekanik */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <Users size={14} color={colors.amber} />
                    <Text style={s.mechName}>
                      {activeUnit.mechanic?.namaMekanik || "Budi Santoso"}
                    </Text>
                    <View style={s.bnspBadge}>
                      <Text style={s.bnspText}>BNSP Level A3</Text>
                    </View>
                  </View>

                  {/* Inner Car Box */}
                  <View style={s.innerCarBox}>
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
                      }}
                      style={s.innerCarImg}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={s.innerCarName} numberOfLines={1}>
                        {activeUnit.vehicle?.merk} {activeUnit.vehicle?.tipe}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        <View style={s.whitePlate}>
                          <Text style={s.whitePlateText}>
                            • {activeUnit.vehicle?.platNomor}
                          </Text>
                        </View>
                        <Text style={s.chassisMono}>
                          {activeUnit.vehicle?.tahun || "Chassis"}
                        </Text>
                      </View>
                      <Text style={s.suiteText} numberOfLines={1}>
                        Suite 02 //{" "}
                        {(activeUnit.bookingDetails ?? [])
                          .map((d) => d.service?.namaLayanan)
                          .join(", ") || "Servis Berkala"}
                      </Text>
                    </View>
                  </View>

                  {/* Tahapan Pit Saat Ini (4 Bars) */}
                  <View style={s.pitStageBox}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={s.pitStageLabel}>TAHAPAN PIT SAAT INI</Text>
                      <Text style={s.pitPct}>
                        {STATUS_PCT[activeUnit.status] || 50}% Selesai
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {PIT_STEPS.map((st, idx) => {
                        const activeStep = STATUS_STEP[activeUnit.status] || 2;
                        const done = idx < activeStep;
                        return (
                          <View key={st} style={{ flex: 1 }}>
                            <View
                              style={[
                                s.barSegment,
                                done && { backgroundColor: colors.amber },
                              ]}
                            />
                            <Text
                              style={[
                                s.barLabel,
                                done && { color: colors.amber },
                              ]}
                              numberOfLines={1}
                            >
                              {done ? `✓ ${st}` : st}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* 2 Kotak Telemetri */}
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
                  >
                    <View style={s.darkMetric}>
                      <Text style={s.dmLabel}>TORSI CENTER LOCK</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          gap: 5,
                          marginTop: 3,
                        }}
                      >
                        <Text style={s.dmVal}>600 Nm</Text>
                        <Text style={s.dmStatusGreen}>PASSED</Text>
                      </View>
                      <Text style={s.dmSub}>Target Pabrik OEM</Text>
                    </View>

                    <View style={s.darkMetric}>
                      <Text style={s.dmLabel}>TEKANAN MINYAK REM</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          gap: 5,
                          marginTop: 3,
                        }}
                      >
                        <Text style={s.dmVal}>2.45 Bar</Text>
                        <Text style={s.dmStatusGreen}>OPTIMAL</Text>
                      </View>
                      <Text style={s.dmSub}>Suhu Kaliper 42°C</Text>
                    </View>
                  </View>

                  {/* 2 Tombol Aksi Bawah */}
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 12 }}
                  >
                    <Pressable
                      onPress={() =>
                        navigation.navigate("BookingDetail", {
                          id: activeUnit.id,
                        })
                      }
                      style={s.cctvBtn}
                    >
                      <Video size={15} color={colors.night} />
                      <Text style={s.cctvBtnText}>Pantau Detail Pit</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        navigation.navigate("Chat", {
                          bookingId: activeUnit.id,
                          code: activeUnit.bookingCode,
                        })
                      }
                      style={s.konsulBtn}
                    >
                      <MessageSquare size={15} color="#FFFFFF" />
                      <Text style={s.konsulBtnText}>Konsul Master</Text>
                    </Pressable>
                  </View>
                </View>
              </FadeIn>
            )}

            {/* DAFTAR JADWAL / RIWAYAT */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 4,
              }}
            >
              <Text style={s.sectionTitle}>
                {tab === "Berjalan"
                  ? "Jadwal Mendatang"
                  : tab === "Mendatang"
                    ? "Antrean Reservasi"
                    : "Riwayat Servis Selesai"}
              </Text>
              <Text style={s.sectionCount}>{all.length} Reservasi Total</Text>
            </View>

            {(tab === "Berjalan" ? upcoming : listByTab).length === 0 ? (
              <Empty
                title="Belum Ada Data di Tab Ini"
                text="Buat jadwal servis baru kapan saja tanpa antre."
                action={
                  <Button
                    title="+ Buat Booking Baru"
                    onPress={() => navigation.navigate("NewBooking")}
                  />
                }
              />
            ) : (
              (tab === "Berjalan" ? upcoming : listByTab).map((b, idx) => (
                <FadeIn key={b.id} delay={idx * 50}>
                  <View style={s.upcomingCard}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View style={s.dpVerifiedBadge}>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#2563EB",
                          }}
                        />
                        <Text style={s.dpVerifiedText}>
                          {b.status === "SELESAI"
                            ? "Servis Selesai • Terarsip"
                            : "DP Terverifikasi • Slot Dikunci"}
                        </Text>
                      </View>
                      <Text style={s.invText}>{b.bookingCode}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginTop: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.upCarTitle}>
                          {b.vehicle?.merk} {b.vehicle?.tipe}
                        </Text>
                        <Text style={s.upServiceSub} numberOfLines={1}>
                          {(b.bookingDetails ?? [])
                            .map((d) => d.service?.namaLayanan)
                            .filter(Boolean)
                            .join(" + ") || "Servis Berkala"}
                        </Text>
                      </View>
                      <View style={s.grayPlate}>
                        <Text style={s.grayPlateText}>
                          {b.vehicle?.platNomor}
                        </Text>
                      </View>
                    </View>

                    {/* Box Tanggal & Alokasi Pit */}
                    <View style={s.scheduleBox}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Calendar size={14} color={colors.amberDeep} />
                        <Text style={s.schedDate}>
                          {tanggalID(b.bookingDate)} • {b.bookingTime} WIB
                        </Text>
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#E7E5E0",
                          marginVertical: 8,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={s.allocLabel}>
                          Alokasi Pit:{" "}
                          <Text style={s.allocVal}>Pit Stall 02</Text>
                        </Text>
                        <Text style={s.allocLabel}>
                          Advisor:{" "}
                          <Text style={s.allocVal}>
                            {b.mechanic?.namaMekanik || "Rio Ardianto"}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Biaya & Deposit */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginTop: 12,
                      }}
                    >
                      <View>
                        <Text style={s.costLabel}>Estimasi Total Biaya</Text>
                        <Text style={s.costVal}>{rupiah(b.totalHarga)}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={s.costLabel}>Deposit Booking (30%)</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <CheckCircle2 size={13} color={colors.amberDeep} />
                          <Text style={s.dpVal}>
                            {rupiah(Math.round((b.totalHarga || 0) * 0.3))}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 2 Tombol Bawah */}
                    <View
                      style={{ flexDirection: "row", gap: 10, marginTop: 14 }}
                    >
                      <Pressable
                        onPress={() =>
                          navigation.navigate("BookingDetail", { id: b.id })
                        }
                        style={s.upBtnGray}
                      >
                        <FileText size={14} color={colors.ink} />
                        <Text style={s.upBtnText}>E-SPK Digital</Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          navigation.navigate("NewBooking", { booking: b })
                        }
                        style={s.upBtnGray}
                      >
                        <Clock size={14} color={colors.ink} />
                        <Text style={s.upBtnText}>Ubah Jadwal</Text>
                      </Pressable>
                    </View>
                  </View>
                </FadeIn>
              ))
            )}

            {/* GARANSI MUTU SABO ATELIER */}
            <View style={s.warrantyCard}>
              <View style={s.warrantyIcon}>
                <ShieldCheck size={20} color={colors.amberDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.warrantyTitle}>Garansi Mutu SABO Atelier</Text>
                <Text style={s.warrantyDesc}>
                  Setiap unit dilindungi garansi mekanis 6 bulan atas suku
                  cadang orisinal. Rekaman video 4K seluruh proses pit stall
                  tersimpan di Cloud Atelier selama 365 hari untuk transparansi
                  total.
                </Text>
                <View style={{ flexDirection: "row", gap: 14, marginTop: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ShieldCheck size={12} color={colors.amberDeep} />
                    <Text style={s.wTag}>Suku Cadang OEM</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Cloud size={12} color={colors.amberDeep} />
                    <Text style={s.wTag}>4K Cloud Log</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CONCIERGE SERVIS 24/7 */}
            <View style={s.conciergeCard}>
              <View style={s.conciergeIcon}>
                <Headphones size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.conciergeTitle}>Concierge Servis 24/7</Text>
                <Text style={s.conciergeSub}>
                  Butuh penjemputan towing tertutup?
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  Linking.openURL("https://wa.me/6281200000000").catch(() => {})
                }
                style={s.hubungiBtn}
              >
                <Text style={s.hubungiText}>Hubungi</Text>
              </Pressable>
            </View>
          </>
        )}
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

  hubEyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amberDeep,
    letterSpacing: 1,
  },
  pageTitle: {
    fontFamily: font.bodyBold,
    fontSize: 23,
    color: colors.ink,
    marginTop: 2,
  },
  liveSyncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveSyncText: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amberDeep,
  },
  subtitle: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },

  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#EFECE4",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  segBtnOn: { backgroundColor: "#14181F" },
  segText: { fontFamily: font.bodyMedium, fontSize: 12.5, color: colors.ink },
  segBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  segBadgeText: { fontFamily: font.bodyBold, fontSize: 10 },

  unitSectionLabel: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.amberDeep,
    letterSpacing: 0.6,
  },
  unitIdMono: { fontFamily: font.mono, fontSize: 10.5, color: colors.muted },

  darkPitCard: {
    backgroundColor: "#17181C",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  liveStallBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveStallText: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: "#34D399",
  },
  signalIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  mechName: { fontFamily: font.bodySemi, fontSize: 13.5, color: "#FFFFFF" },
  bnspBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bnspText: { fontFamily: font.mono, fontSize: 9.5, color: "#E2E8F0" },

  innerCarBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
  },
  innerCarImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#334155",
  },
  innerCarName: { fontFamily: font.bodyBold, fontSize: 15.5, color: "#FFFFFF" },
  whitePlate: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  whitePlateText: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.night,
  },
  chassisMono: { fontFamily: font.mono, fontSize: 10.5, color: "#94A3B8" },
  suiteText: {
    fontFamily: font.mono,
    fontSize: 10,
    color: colors.amber,
    marginTop: 5,
  },

  pitStageBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  pitStageLabel: { fontFamily: font.mono, fontSize: 9.5, color: "#94A3B8" },
  pitPct: { fontFamily: font.bodyBold, fontSize: 12, color: colors.amber },
  barSegment: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#334155",
    marginBottom: 5,
  },
  barLabel: { fontFamily: font.mono, fontSize: 9, color: "#94A3B8" },

  darkMetric: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 13,
    padding: 11,
  },
  dmLabel: { fontFamily: font.mono, fontSize: 8.5, color: "#94A3B8" },
  dmVal: { fontFamily: font.bodyBold, fontSize: 15, color: "#FFFFFF" },
  dmStatusGreen: { fontFamily: font.monoMedium, fontSize: 9, color: "#34D399" },
  dmSub: {
    fontFamily: font.body,
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 2,
  },

  cctvBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.amber,
    borderRadius: 11,
    paddingVertical: 11,
  },
  cctvBtnText: {
    fontFamily: font.bodyBold,
    fontSize: 12.5,
    color: colors.night,
  },
  konsulBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 11,
    paddingVertical: 11,
  },
  konsulBtnText: {
    fontFamily: font.bodySemi,
    fontSize: 12.5,
    color: "#FFFFFF",
  },

  sectionTitle: { fontFamily: font.bodyBold, fontSize: 16, color: colors.ink },
  sectionCount: {
    fontFamily: font.mono,
    fontSize: 11,
    color: colors.amberDeep,
  },

  upcomingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 14,
  },
  dpVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dpVerifiedText: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: "#1D4ED8",
  },
  invText: { fontFamily: font.mono, fontSize: 10, color: colors.muted },
  upCarTitle: { fontFamily: font.bodyBold, fontSize: 16, color: colors.ink },
  upServiceSub: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  grayPlate: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  grayPlateText: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.ink,
  },

  scheduleBox: {
    backgroundColor: "#FAF8F5",
    borderRadius: 13,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  schedDate: { fontFamily: font.bodyBold, fontSize: 12.5, color: colors.ink },
  allocLabel: { fontFamily: font.mono, fontSize: 10, color: colors.muted },
  allocVal: { fontFamily: font.bodyBold, color: colors.ink },

  costLabel: { fontFamily: font.mono, fontSize: 10, color: colors.muted },
  costVal: {
    fontFamily: font.bodyBold,
    fontSize: 17,
    color: colors.ink,
    marginTop: 2,
  },
  dpVal: { fontFamily: font.bodyBold, fontSize: 13, color: colors.amberDeep },

  upBtnGray: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F3F1EC",
    paddingVertical: 10,
    borderRadius: 11,
  },
  upBtnText: { fontFamily: font.bodySemi, fontSize: 12.5, color: colors.ink },

  warrantyCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 12,
  },
  warrantyIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  warrantyTitle: { fontFamily: font.bodyBold, fontSize: 14, color: colors.ink },
  warrantyDesc: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 16,
  },
  wTag: { fontFamily: font.monoMedium, fontSize: 10, color: colors.amberDeep },

  conciergeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 12,
  },
  conciergeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  conciergeTitle: {
    fontFamily: font.bodyBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  conciergeSub: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  hubungiBtn: {
    backgroundColor: "#F3F1EC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hubungiText: { fontFamily: font.bodyBold, fontSize: 12, color: colors.ink },
});
