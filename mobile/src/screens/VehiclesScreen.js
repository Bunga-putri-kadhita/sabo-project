import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Bell,
  BookOpen,
  Calendar,
  CarFront,
  ChevronRight,
  Clock,
  Disc,
  FileCheck2,
  Gauge,
  Headphones,
  Lock,
  MoreVertical,
  Plus,
  Radio,
  ShieldCheck,
  Sliders,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react-native";
import { vehicleApi } from "../api/data";
import { errMsg } from "../api/client";
import {
  Button,
  Empty,
  ErrorBanner,
  FadeIn,
  Field,
  Screen,
  Skeleton,
} from "../components/ui";
import useLoad from "../hooks/useLoad";
import { colors, font } from "../theme";

const TRANSMISI_OPTIONS = ["Automatic", "Manual"];

export default function VehiclesScreen({ navigation }) {
  const {
    data: vehicles,
    loading,
    error,
    refreshing,
    refresh,
    setData,
  } = useLoad(vehicleApi.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [merk, setMerk] = useState("");
  const [tipe, setTipe] = useState("");
  const [tahun, setTahun] = useState("");
  const [platNomor, setPlatNomor] = useState("");
  const [transmisi, setTransmisi] = useState("Automatic");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const list = vehicles ?? [];
  const mainCar = list[0];
  const otherCars = list.slice(1);

  function openForm(car = null) {
    setEditing(car);
    setMerk(car?.merk || "");
    setTipe(car?.tipe || "");
    setTahun(car?.tahun ? String(car.tahun) : "2023");
    setPlatNomor(car?.platNomor || "");
    setTransmisi(car?.transmisi || "Automatic");
    setFormErr("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (
      !merk.trim() ||
      !tipe.trim() ||
      !platNomor.trim() ||
      !transmisi.trim() ||
      !String(tahun).trim()
    ) {
      setFormErr(
        "Semua data kendaraan (merk, tipe, transmisi, tahun, plat nomor) wajib diisi.",
      );
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      const payload = {
        merk: merk.trim(),
        tipe: tipe.trim(),
        transmisi: transmisi.trim(),
        tahun: Number(tahun) || 2023,
        platNomor: platNomor.trim().toUpperCase(),
      };
      if (editing) {
        const res = await vehicleApi.update(editing.id, payload);
        const updated = res?.data?.data ?? res;
        setData(list.map((v) => (v.id === editing.id ? updated : v)));
      } else {
        const res = await vehicleApi.create(payload);
        const created = res?.data?.data ?? res;
        setData([created, ...list]);
      }
      setModalOpen(false);
    } catch (e) {
      setFormErr(errMsg(e, "Gagal menyimpan data kendaraan."));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(car) {
    Alert.alert(
      "Hapus Kendaraan",
      `Hapus ${car.merk} ${car.tipe} (${car.platNomor}) dari garasi?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await vehicleApi.remove(car.id);
              setData(list.filter((v) => v.id !== car.id));
            } catch (e) {
              Alert.alert(
                "Gagal",
                errMsg(e, "Tidak dapat menghapus kendaraan."),
              );
            }
          },
        },
      ],
    );
  }

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
              <Text style={s.atelierTitle}>Kendaraan</Text>
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

        {/* HEADER SECTION */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.vaultTag}>• DIGITAL ATELIER VAULT</Text>
            <Text style={s.pageTitle}>Garasi Kendaraan</Text>
          </View>
          <Pressable onPress={() => openForm()} style={s.addBtn}>
            <Plus size={14} color={colors.ink} strokeWidth={2.5} />
            <Text style={s.addBtnText}>+ Tambah</Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 16,
          }}
        >
          <ShieldCheck size={14} color={colors.amberDeep} />
          <Text style={s.subInfo}>
            {list.length} Kendaraan Terdaftar • Paspor Telemetri Digital Aktif
          </Text>
        </View>

        <ErrorBanner message={error} />

        {loading ? (
          <>
            <Skeleton h={340} />
            <Skeleton h={190} />
          </>
        ) : list.length === 0 ? (
          <Empty
            title="Garasi Masih Kosong"
            text="Tambahkan unit kendaraan pertamamu untuk mulai memantau telemetri & jadwal servis."
            action={
              <Button title="+ Tambah Kendaraan" onPress={() => openForm()} />
            }
          />
        ) : (
          <>
            {/* KARTU KENDARAAN UTAMA */}
            {mainCar && (
              <FadeIn>
                <View style={s.mainCard}>
                  {/* Top Badges */}
                  <View style={s.cardTopRow}>
                    <View style={s.primaryPill}>
                      <ShieldCheck size={12} color={colors.amberDeep} />
                      <Text style={s.primaryPillText}>KENDARAAN UTAMA</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Radio size={13} color="#2563EB" />
                        <Text style={s.obdText}>Live OBD-II</Text>
                      </View>
                      <Pressable onPress={() => openForm(mainCar)} hitSlop={8}>
                        <MoreVertical size={16} color={colors.muted} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Hero Car Image */}
                  <View style={s.heroImgWrap}>
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85",
                      }}
                      style={s.heroImg}
                    />
                    <View style={s.heroImgOverlay}>
                      <Text style={s.specMono}>
                        MY{mainCar.tahun} •{" "}
                        {mainCar.transmisi
                          ? mainCar.transmisi.toUpperCase()
                          : "ATELIER SPEC"}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <Text style={s.heroCarTitle} numberOfLines={1}>
                          {mainCar.merk} {mainCar.tipe}
                        </Text>
                        <View style={s.chassisChip}>
                          <Text style={s.chassisText}>{mainCar.tahun}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Plat Nomor & Pit Stall */}
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 12 }}
                  >
                    <View style={s.plateBox}>
                      <Text style={s.plateNumber}>• {mainCar.platNomor} •</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 3,
                        }}
                      >
                        <Text style={s.plateSub}>RI</Text>
                        <Text style={s.plateSub}>08 • 28</Text>
                      </View>
                    </View>

                    <View style={s.pitBox}>
                      <View style={s.pitIcon}>
                        <Wrench size={15} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.pitLabel}>• PIT STALL #03</Text>
                        <Text style={s.pitVal} numberOfLines={1}>
                          Siap Inspeksi
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3 Kotak Telemetri */}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <View style={s.metricBox}>
                      <Gauge size={15} color={colors.amberDeep} />
                      <Text style={s.metricLabel}>ODO LIVE</Text>
                      <Text style={s.metricVal}>14.820</Text>
                      <Text style={s.metricUnit}>KM</Text>
                    </View>

                    <View style={s.metricBox}>
                      <Disc size={15} color="#2563EB" />
                      <Text style={s.metricLabel}>KANVAS REM</Text>
                      <Text style={s.metricVal}>94%</Text>
                      <Text style={[s.metricUnit, { color: "#16A34A" }]}>
                        Optimal
                      </Text>
                    </View>

                    <View style={s.metricBox}>
                      <Sliders size={15} color={colors.ink} />
                      <Text style={s.metricLabel}>TRANSMISI</Text>
                      <Text style={s.metricVal} numberOfLines={1}>
                        {mainCar.transmisi === "Manual" ? "Manual" : "Auto"}
                      </Text>
                      <Text style={s.metricUnit}>Optimal</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <Pressable
                    onPress={() => navigation.navigate("NewBooking")}
                    style={({ pressed }) => [
                      s.primaryCta,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Calendar
                      size={16}
                      color={colors.night}
                      strokeWidth={2.3}
                    />
                    <Text style={s.primaryCtaText}>Reservasi Servis Baru</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("Booking")}
                    style={s.secondaryCta}
                  >
                    <BookOpen size={15} color={colors.ink} />
                    <Text style={s.secondaryCtaText}>
                      Paspor Servis & Buku Manual Digital
                    </Text>
                  </Pressable>
                </View>
              </FadeIn>
            )}

            {/* KARTU KENDARAAN LAINNYA */}
            {otherCars.map((car, idx) => (
              <FadeIn key={car.id} delay={(idx + 1) * 60}>
                <View style={s.subCarCard}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={s.thumbWrap}>
                      <Image
                        source={{
                          uri: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80",
                        }}
                        style={s.thumbImg}
                      />
                      <View style={s.thumbTag}>
                        <Text style={s.thumbTagText}>{car.tahun}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text style={s.subCarSpec}>
                          MY{car.tahun} •{" "}
                          {car.transmisi
                            ? car.transmisi.toUpperCase()
                            : "ATELIER UNIT"}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Pressable onPress={() => openForm(car)} hitSlop={8}>
                            <MoreVertical size={15} color={colors.muted} />
                          </Pressable>
                          <Pressable
                            onPress={() => confirmDelete(car)}
                            hitSlop={8}
                          >
                            <Trash2 size={14} color={colors.danger} />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={s.subCarTitle}>
                        {car.merk} {car.tipe}
                      </Text>

                      <View style={s.miniPlate}>
                        <Text style={s.miniPlateText}>{car.platNomor}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Jarak Tempuh & Oil Life */}
                  <View style={s.oilCard}>
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
                          gap: 5,
                        }}
                      >
                        <Gauge size={13} color={colors.amberDeep} />
                        <Text style={s.odoSmall}>
                          Jarak Tempuh:{" "}
                          <Text style={{ fontFamily: font.bodyBold }}>
                            28.450 KM
                          </Text>
                        </Text>
                      </View>
                      <View style={s.homeTag}>
                        <Text style={s.homeTagText}>Garasi Rumah</Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={s.oilLabel}>
                        Kondisi Pelumas Mesin (Oil Life)
                      </Text>
                      <Text style={s.oilPct}>
                        82%{"\n"}
                        <Text style={{ fontSize: 10 }}>Sehat</Text>
                      </Text>
                    </View>

                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: "82%" }]} />
                    </View>
                    <Text style={s.oilHint}>
                      Jadwal ganti berkala dalam 1.500 KM lagi
                    </Text>
                  </View>

                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 12 }}
                  >
                    <Pressable
                      onPress={() => navigation.navigate("Booking")}
                      style={s.subBtnGray}
                    >
                      <Clock size={14} color={colors.ink} />
                      <Text style={s.subBtnGrayText}>Riwayat Servis</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => navigation.navigate("NewBooking")}
                      style={s.subBtnCream}
                    >
                      <Calendar size={14} color={colors.amberDeep} />
                      <Text style={s.subBtnCreamText}>Jadwal Rutin</Text>
                    </Pressable>
                  </View>
                </View>
              </FadeIn>
            ))}

            {/* KARTU DOKUMEN TERENKRIPSI */}
            <View style={s.vaultCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={s.lockBox}>
                    <Lock size={16} color={colors.ink} />
                  </View>
                  <View>
                    <Text style={s.vaultTitle}>Dokumen Terenkripsi</Text>
                    <Text style={s.vaultSub}>
                      SABO Vault 256-Bit Cloud Sync
                    </Text>
                  </View>
                </View>
                <View style={s.validBadge}>
                  <Text style={s.validText}>3{"\n"}VALID</Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                <View style={s.docRow}>
                  <FileCheck2 size={18} color={colors.amberDeep} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>STNK Digital & Faktur Asli</Text>
                    <Text style={s.docSub}>
                      2 Salinan Diverifikasi Kepolisian RI
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </View>

                <View style={s.docRow}>
                  <ShieldCheck size={18} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>
                      Garansi SABO Atelier Platinum
                    </Text>
                    <Text style={s.docSub}>Berlaku s/d Desember 2026</Text>
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </View>

                <View style={s.docRow}>
                  <Sliders size={18} color={colors.ink} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>
                      Telemetri Suspensi & Torsi Kaki
                    </Text>
                    <Text style={s.docSub}>
                      Log Terakhir: 12 Hari Lalu di Pit #01
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.muted} />
                </View>
              </View>
            </View>

            {/* BANNER TOWING */}
            <View style={s.towingBanner}>
              <Headphones size={18} color={colors.ink} />
              <Text style={s.towingText}>
                Butuh penjemputan towing tertutup (
                <Text style={{ fontStyle: "italic" }}>enclosed trailer</Text>)?
              </Text>
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    "https://wa.me/6281200000000?text=Halo%20SABO,%20saya%20butuh%20towing%20tertutup.",
                  ).catch(() => {})
                }
              >
                <Text style={s.towingLink}>Hubungi</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* MODAL TAMBAH / EDIT KENDARAAN */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text style={s.modalTitle}>
                {editing ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
              </Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <X size={20} color={colors.muted} />
              </Pressable>
            </View>

            <ErrorBanner message={formErr} />

            <Field
              label="Merk Kendaraan"
              placeholder="Contoh: Porsche / BMW / Honda"
              value={merk}
              onChangeText={setMerk}
            />
            <Field
              label="Tipe / Model"
              placeholder="Contoh: 911 GT3 / M3 / Civic"
              value={tipe}
              onChangeText={setTipe}
            />

            {/* PILIHAN TRANSMISI */}
            <View style={{ marginBottom: 12 }}>
              <Text style={s.fieldLabel}>Transmisi</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {TRANSMISI_OPTIONS.map((opt) => {
                  const active = transmisi === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setTransmisi(opt)}
                      style={[s.transPill, active && s.transPillActive]}
                    >
                      <Text
                        style={[
                          s.transPillText,
                          active && s.transPillTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Field
              label="Tahun"
              placeholder="2023"
              keyboardType="numeric"
              value={tahun}
              onChangeText={setTahun}
            />
            <Field
              label="Plat Nomor"
              placeholder="B 1888 SAB"
              autoCapitalize="characters"
              value={platNomor}
              onChangeText={setPlatNomor}
            />

            <Button
              title={editing ? "Simpan Perubahan" : "Simpan ke Garasi"}
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </View>
      </Modal>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vaultTag: {
    fontFamily: font.monoMedium,
    fontSize: 10,
    color: colors.amberDeep,
    letterSpacing: 0.8,
  },
  pageTitle: {
    fontFamily: font.bodyBold,
    fontSize: 23,
    color: colors.ink,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFECE4",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2DFD7",
  },
  addBtnText: { fontFamily: font.bodyBold, fontSize: 12, color: colors.ink },
  subInfo: { fontFamily: font.body, fontSize: 12, color: colors.muted },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  primaryPillText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: colors.amberDeep,
  },
  obdText: { fontFamily: font.monoMedium, fontSize: 11, color: "#2563EB" },

  heroImgWrap: {
    height: 155,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1E293B",
  },
  heroImg: { width: "100%", height: "100%" },
  heroImgOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(15,23,42,0.68)",
  },
  specMono: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: "#CBD5E1",
    letterSpacing: 0.5,
  },
  heroCarTitle: {
    fontFamily: font.bodyBold,
    fontSize: 17,
    color: "#FFFFFF",
    flex: 1,
  },
  chassisChip: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chassisText: {
    fontFamily: font.monoMedium,
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  plateBox: {
    flex: 1,
    backgroundColor: "#14181F",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  plateNumber: {
    fontFamily: font.monoMedium,
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
  },
  plateSub: { fontFamily: font.mono, fontSize: 9, color: "#94A3B8" },

  pitBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FAF8F5",
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  pitIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  pitLabel: { fontFamily: font.mono, fontSize: 9, color: colors.amberDeep },
  pitVal: {
    fontFamily: font.bodyBold,
    fontSize: 12,
    color: colors.ink,
    marginTop: 1,
  },

  metricBox: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  metricLabel: {
    fontFamily: font.mono,
    fontSize: 9,
    color: colors.muted,
    marginTop: 5,
  },
  metricVal: {
    fontFamily: font.bodyBold,
    fontSize: 14,
    color: colors.ink,
    marginTop: 2,
  },
  metricUnit: { fontFamily: font.mono, fontSize: 9.5, color: colors.muted },

  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.amber,
    borderRadius: 12,
    minHeight: 45,
    marginTop: 14,
  },
  primaryCtaText: {
    fontFamily: font.bodyBold,
    fontSize: 13.5,
    color: colors.night,
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#F5F3EE",
    borderRadius: 12,
    minHeight: 42,
    marginTop: 8,
  },
  secondaryCtaText: {
    fontFamily: font.bodySemi,
    fontSize: 12.5,
    color: colors.ink,
  },

  subCarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 16,
  },
  thumbWrap: {
    width: 84,
    height: 84,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbTag: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(15,23,42,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  thumbTagText: { fontFamily: font.mono, fontSize: 9, color: "#FFF" },
  subCarSpec: { fontFamily: font.mono, fontSize: 9.5, color: colors.muted },
  subCarTitle: {
    fontFamily: font.bodyBold,
    fontSize: 16,
    color: colors.ink,
    marginTop: 2,
  },
  miniPlate: {
    alignSelf: "flex-start",
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
    marginTop: 7,
  },
  miniPlateText: {
    fontFamily: font.monoMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },

  oilCard: {
    backgroundColor: "#FAF8F5",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  odoSmall: { fontFamily: font.body, fontSize: 12, color: colors.ink },
  homeTag: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  homeTagText: { fontFamily: font.mono, fontSize: 9.5, color: "#334155" },
  oilLabel: {
    fontFamily: font.mono,
    fontSize: 10.5,
    color: colors.ink,
    flex: 1,
  },
  oilPct: {
    fontFamily: font.monoMedium,
    fontSize: 11.5,
    color: colors.amberDeep,
    textAlign: "right",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.amber,
    borderRadius: 4,
  },
  oilHint: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },

  subBtnGray: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1EFEA",
    paddingVertical: 10,
    borderRadius: 11,
  },
  subBtnGrayText: {
    fontFamily: font.bodySemi,
    fontSize: 12,
    color: colors.ink,
  },
  subBtnCream: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FDE68A",
    paddingVertical: 10,
    borderRadius: 11,
  },
  subBtnCreamText: {
    fontFamily: font.bodyBold,
    fontSize: 12,
    color: colors.amberDeep,
  },

  vaultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E7E5E0",
    marginBottom: 14,
  },
  lockBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EFE6",
    alignItems: "center",
    justifyContent: "center",
  },
  vaultTitle: { fontFamily: font.bodyBold, fontSize: 15, color: colors.ink },
  vaultSub: { fontFamily: font.mono, fontSize: 10, color: colors.muted },
  validBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  validText: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    color: colors.amberDeep,
    textAlign: "center",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FAF8F5",
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#EFECE4",
  },
  docTitle: { fontFamily: font.bodyBold, fontSize: 13, color: colors.ink },
  docSub: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },

  towingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFECE4",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  towingText: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.ink,
    lineHeight: 16,
  },
  towingLink: {
    fontFamily: font.bodyBold,
    fontSize: 12,
    color: colors.amberDeep,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: { fontFamily: font.bodyBold, fontSize: 18, color: colors.ink },

  fieldLabel: {
    fontFamily: font.bodySemi,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: 6,
  },
  transPill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E2DFD7",
    backgroundColor: "#FAF8F5",
    alignItems: "center",
  },
  transPillActive: {
    borderColor: colors.amberDeep,
    backgroundColor: "#FEF3C7",
  },
  transPillText: {
    fontFamily: font.bodySemi,
    fontSize: 13,
    color: colors.muted,
  },
  transPillTextActive: {
    fontFamily: font.bodyBold,
    color: colors.amberDeep,
  },
});
