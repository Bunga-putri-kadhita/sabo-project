import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  MessageSquare,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from "lucide-react-native";
import { serviceApi } from "../api/data";
import { useAuth } from "../auth/AuthContext";
import { Empty, ErrorBanner, FadeIn, Screen, Skeleton } from "../components/ui";
import useLoad from "../hooks/useLoad";
import { colors, font } from "../theme";
import { menit, rupiah } from "../utils/format";

const CATEGORIES = [
  "Semua",
  "Servis Berkala",
  "Oli & Mesin",
  "Rem & Kaki",
  "AC",
];

// Pemetaan badge & highlight visual otomatis berdasarkan nama layanan dari backend
function getServiceMeta(name = "", index = 0) {
  const lower = name.toLowerCase();
  if (lower.includes("oli")) {
    return {
      tag: "EXPRESS BAY",
      tagBg: "#DBEAFE",
      tagFg: "#1D4ED8",
      perk: "Tanpa Antre",
      priceLabel: "Jasa & Pengecekan",
      cat: "Oli & Mesin",
    };
  }
  if (lower.includes("tune") || lower.includes("gurah")) {
    return {
      tag: "PERFORMA",
      tagBg: "#FEF3C7",
      tagFg: "#B45309",
      perk: "Responsif",
      priceLabel: "Biaya Paket",
      cat: "Oli & Mesin",
    };
  }
  if (lower.includes("spooring") || lower.includes("balancing")) {
    return {
      tag: "SENSOR 3D",
      tagBg: "#E0E7FF",
      tagFg: "#4338CA",
      perk: "Toleransi 0.01°",
      priceLabel: "Set 4 Roda",
      cat: "Rem & Kaki",
    };
  }
  if (lower.includes("rem")) {
    return {
      tag: "SAFETY CRITICAL",
      tagBg: "#FEE2E2",
      tagFg: "#B91C1C",
      perk: "Vacuum Bleeding",
      priceLabel: "Biaya Lengkap",
      cat: "Rem & Kaki",
    };
  }
  if (lower.includes("ac")) {
    return {
      tag: "FRESH CABIN",
      tagBg: "#E0F2FE",
      tagFg: "#0369A1",
      perk: "Anti-Bakteri",
      priceLabel: "Paket Refresh AC",
      cat: "AC",
    };
  }
  return {
    tag: index === 0 ? "REKOMENDASI" : "STANDAR RESMI",
    tagBg: "#FEF3C7",
    tagFg: "#B45309",
    perk: "Garansi 14 Hari",
    priceLabel: "Mulai Dari",
    cat: "Servis Berkala",
  };
}

// Memecah deskripsi backend menjadi poin-poin cakupan kerja berikon centang
function parseScopes(deskripsi) {
  if (!deskripsi) {
    return [
      "Inspeksi teliti titik keselamatan kendaraan",
      "Pengerjaan oleh mekanik bersertifikat SABO",
    ];
  }
  const parts = deskripsi
    .split(/,|\n|;/)
    .map((t) => t.trim().replace(/\.$/, ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.slice(0, 3) : [deskripsi];
}

export default function ServicesScreen({ navigation }) {
  const { user } = useAuth();
  const {
    data: services,
    loading,
    error,
    refreshing,
    refresh,
  } = useLoad(serviceApi.list);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Semua");

  const fullName = user?.name || "Pelanggan";

  const list = (services ?? []).filter((srv, idx) => {
    const meta = getServiceMeta(srv.namaLayanan, idx);
    const matchSearch =
      srv.namaLayanan.toLowerCase().includes(search.toLowerCase()) ||
      (srv.deskripsi || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "Semua" || meta.cat === activeCat;
    return matchSearch && matchCat;
  });

  const openWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/6281200000000?text=Halo%20SA%20SABO,%20saya%20bingung%20pilih%20paket%20servis.",
    ).catch(() => {});
  };

  return (
    <Screen tab onRefresh={refresh} refreshing={refreshing} padded={false}>
      <View style={{ paddingHorizontal: 18 }}>
        {/* TOP HEADER BAR */}
        <View style={s.topBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={s.logoBox}>
              <Text style={s.logoLetter}>S</Text>
            </View>
            <View>
              <Text style={s.brandTitle}>SABO</Text>
              <Text style={s.brandSub}>BENGKEL ONLINE</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => navigation.navigate("Booking")}
              style={s.notifBtn}
            >
              <Bell size={20} color={colors.ink} strokeWidth={2} />
              <View style={s.notifDot} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Profil")}
              style={s.avatarBtn}
            >
              <Text style={s.avatarText}>
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* PAGE TITLE */}
        <Text style={s.eyebrow}>KATALOG LAYANAN PRESISI</Text>
        <Text style={s.pageTitle}>Pilih Perawatan Kendaraan</Text>

        {/* SEARCH BAR */}
        <View style={s.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            placeholder="Cari paket servis, oli, rem, AC..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={s.searchInput}
          />
        </View>
      </View>

      {/* FILTER PILLS HORIZONTAL */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          gap: 8,
          paddingBottom: 14,
        }}
      >
        {CATEGORIES.map((cat, idx) => {
          const on = activeCat === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCat(cat)}
              style={[s.filterPill, on && s.filterPillOn]}
            >
              {idx === 0 && (
                <SlidersHorizontal size={13} color={on ? "#FFF" : colors.ink} />
              )}
              <Text
                style={[
                  s.filterText,
                  on && { color: "#FFFFFF", fontFamily: font.bodyBold },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 18 }}>
        {/* BANNER GARANSI TRANSPARANSI 100% */}
        <View style={s.guaranteeCard}>
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <View style={s.shieldBox}>
              <Shield size={22} color={colors.night} fill={colors.night} />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <Text style={s.guaranteeTitle}>
                  Garansi Transparansi{"\n"}100%
                </Text>
                <View style={s.saboCareBadge}>
                  <Text style={s.saboCareText}>SABO{"\n"}CARE</Text>
                </View>
              </View>
              <Text style={s.guaranteeDesc}>
                Estimasi biaya transparan tanpa biaya siluman. DP terjangkau via{" "}
                <Text style={{ color: "#FFF", fontFamily: font.bodyBold }}>
                  QRIS
                </Text>
                , pelunasan setelah mobil selesai diuji coba langsung di
                bengkel.
              </Text>
            </View>
          </View>

          <View style={s.guaranteeFooter}>
            <View style={s.gPoint}>
              <CheckCircle2 size={14} color={colors.amber} />
              <Text style={s.gPointText}>Invoice{"\n"}Digital</Text>
            </View>
            <View style={s.gPoint}>
              <CheckCircle2 size={14} color={colors.amber} />
              <Text style={s.gPointText}>Part Bekas{"\n"}Diserahkan</Text>
            </View>
          </View>
        </View>

        {/* STATUS BAR STALL */}
        <View style={s.stallBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: "#10B981",
              }}
            />
            <Text style={s.stallLeft}>6 STALL SIAP MELAYANI</Text>
          </View>
          <Text style={s.stallRight}>Estimasi Masuk {"<"} 15 Mnt</Text>
        </View>

        <ErrorBanner message={error} />

        {loading ? (
          <>
            <Skeleton h={210} />
            <Skeleton h={210} />
          </>
        ) : list.length === 0 ? (
          <Empty
            title="Layanan Tidak Ditemukan"
            text="Coba kata kunci atau kategori lain."
          />
        ) : (
          list.map((srv, idx) => {
            const meta = getServiceMeta(srv.namaLayanan, idx);
            const scopes = parseScopes(srv.deskripsi);

            return (
              <FadeIn key={srv.id} delay={idx * 45}>
                <View style={s.serviceCard}>
                  {/* Baris Atas: Ikon + Badge Kategori + Judul */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={s.srvIconBox}>
                      <Wrench size={22} color="#92400E" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={[s.catBadge, { backgroundColor: meta.tagBg }]}
                      >
                        <Text style={[s.catBadgeText, { color: meta.tagFg }]}>
                          {meta.tag}
                        </Text>
                      </View>
                      <Text style={s.srvTitle}>{srv.namaLayanan}</Text>
                    </View>
                  </View>

                  {/* Kotak Metrik (Durasi • Keunggulan) */}
                  <View style={s.metricsBar}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Clock size={13} color={colors.muted} />
                      <Text style={s.metricText}>
                        {menit(srv.estimasiMenit)}
                      </Text>
                    </View>
                    <Text style={{ color: "#CBD5E1" }}>•</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Sparkles size={13} color="#2563EB" />
                      <Text style={s.metricText}>{meta.perk}</Text>
                    </View>
                  </View>

                  {/* Cakupan Kerja */}
                  <Text style={s.scopeHeader}>CAKUPAN KERJA:</Text>
                  <View style={{ gap: 6, marginBottom: 14 }}>
                    {scopes.map((pt, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          color="#92400E"
                          style={{ marginTop: 2 }}
                        />
                        <Text style={s.scopeItem}>{pt}</Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#EFECE4",
                      marginBottom: 12,
                    }}
                  />

                  {/* Footer: Harga & Tombol Pilih Jadwal */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text style={s.priceLabel}>{meta.priceLabel}</Text>
                      <Text style={s.priceVal}>{rupiah(srv.harga)}</Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        navigation.navigate("NewBooking", {
                          preselectedService: srv,
                        })
                      }
                      style={({ pressed }) => [
                        s.scheduleBtn,
                        pressed && {
                          opacity: 0.88,
                          transform: [{ scale: 0.98 }],
                        },
                      ]}
                    >
                      <Text style={s.scheduleBtnText}>Pilih Jadwal</Text>
                      <Calendar
                        size={15}
                        color={colors.night}
                        strokeWidth={2.2}
                      />
                    </Pressable>
                  </View>
                </View>
              </FadeIn>
            );
          })
        )}

        {/* BANNER BINGUNG PILIH PAKET */}
        <View style={s.helpBanner}>
          <View style={s.helpIconWrap}>
            <Headphones size={20} color={colors.amber} />
            <View style={s.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.helpTitle}>Bingung Pilih Paket?</Text>
            <Text style={s.helpSub}>
              Tanya Service Advisor SABO live via chat
            </Text>
          </View>
          <Pressable onPress={openWhatsApp} style={s.chatSaBtn}>
            <MessageSquare size={14} color={colors.amber} />
            <Text style={s.chatSaText}>Chat SA</Text>
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
    marginBottom: 10,
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

  eyebrow: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: "#92400E",
    letterSpacing: 1,
  },
  pageTitle: {
    fontFamily: font.bodyBold,
    fontSize: 22,
    color: colors.ink,
    marginTop: 3,
    marginBottom: 14,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFECE4",
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 14,
    color: colors.ink,
  },

  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFECE4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterPillOn: { backgroundColor: "#141B29" },
  filterText: {
    fontFamily: font.bodyMedium,
    fontSize: 12.5,
    color: colors.ink,
  },

  guaranteeCard: {
    backgroundColor: "#141B29",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  shieldBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeTitle: {
    fontFamily: font.bodyBold,
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 21,
  },
  saboCareBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  saboCareText: {
    fontFamily: font.mono,
    fontSize: 8.5,
    color: "#CBD5E1",
    textAlign: "center",
  },
  guaranteeDesc: {
    fontFamily: font.body,
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 17,
  },
  guaranteeFooter: {
    flexDirection: "row",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 12,
    marginTop: 14,
  },
  gPoint: { flexDirection: "row", alignItems: "center", gap: 7 },
  gPointText: {
    fontFamily: font.mono,
    fontSize: 10.5,
    color: "#E2E8F0",
    lineHeight: 13,
  },

  stallBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stallLeft: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  stallRight: { fontFamily: font.mono, fontSize: 10.5, color: colors.muted },

  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginBottom: 14,
  },
  srvIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F6F2E9",
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 5,
  },
  catBadgeText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  srvTitle: {
    fontFamily: font.bodyBold,
    fontSize: 17,
    color: colors.ink,
    lineHeight: 22,
  },

  metricsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FAF8F5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  metricText: { fontFamily: font.mono, fontSize: 11.5, color: colors.ink },

  scopeHeader: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  scopeItem: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 12.5,
    color: "#334155",
    lineHeight: 17,
  },

  priceLabel: { fontFamily: font.mono, fontSize: 11, color: colors.muted },
  priceVal: {
    fontFamily: font.bodyBold,
    fontSize: 18,
    color: colors.ink,
    marginTop: 2,
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.amber,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  scheduleBtnText: {
    fontFamily: font.bodyBold,
    fontSize: 13.5,
    color: colors.night,
  },

  helpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3EFE6",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E2D8",
    marginTop: 4,
    marginBottom: 12,
  },
  helpIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#141B29",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#F3EFE6",
  },
  helpTitle: { fontFamily: font.bodyBold, fontSize: 13.5, color: colors.ink },
  helpSub: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
  },
  chatSaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#141B29",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatSaText: { fontFamily: font.bodyBold, fontSize: 12.5, color: "#FFFFFF" },
});
