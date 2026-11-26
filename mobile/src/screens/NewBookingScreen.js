import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { bookingApi, serviceApi, vehicleApi } from "../api/data";
import { errMsg } from "../api/client";
import useLoad from "../hooks/useLoad";
import {
  Button,
  Card,
  Empty,
  ErrorBanner,
  Row,
  ScreenHeader,
  Skeleton,
} from "../components/ui";
import { colors, font } from "../theme";
import { HARI_KE_DEPAN, JAM_BUKA, JAM_TUTUP, SLOT_MENIT } from "../config";
import {
  HARI,
  jamSekarang,
  menit,
  rupiah,
  tanggal,
  toYMD,
} from "../utils/format";

const STEPS = ["Kendaraan", "Layanan", "Jadwal", "Ringkasan"];
const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function slotList() {
  const [h0, m0] = JAM_BUKA.split(":").map(Number);
  const [h1, m1] = JAM_TUTUP.split(":").map(Number);
  const out = [];
  for (let t = h0 * 60 + m0; t <= h1 * 60 + m1; t += SLOT_MENIT) {
    out.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
    );
  }
  return out;
}

function days() {
  const out = [];
  const base = new Date();
  for (let i = 0; i < HARI_KE_DEPAN; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      ymd: toYMD(d),
      hari: HARI[d.getDay()],
      tgl: d.getDate(),
      bln: BULAN[d.getMonth()],
      today: i === 0,
    });
  }
  return out;
}

function Option({ on, onPress, children, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [
        {
          borderRadius: 16,
          borderWidth: 2,
          borderColor: on ? colors.amber : colors.line,
          backgroundColor: on ? "#FFFBEB" : colors.card,
          padding: 14,
          marginBottom: 10,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      {children}
    </Pressable>
  );
}

export default function NewBookingScreen({ navigation, route }) {
  const editing = route.params?.booking;
  const { data, loading, error, reload } = useLoad(async () => {
    const [vehicles, services] = await Promise.all([
      vehicleApi.list(),
      serviceApi.list(),
    ]);
    return { vehicles, services };
  });

  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState(editing?.vehicleId ?? null);
  const [serviceIds, setServiceIds] = useState(
    editing
      ? editing.bookingDetails.map((d) => d.serviceId)
      : route.params?.serviceId
        ? [route.params.serviceId]
        : [],
  );
  const [date, setDate] = useState(
    editing ? editing.bookingDate.slice(0, 10) : null,
  );
  const [time, setTime] = useState(editing?.bookingTime ?? null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const vehicles = data?.vehicles ?? [];
  const services = data?.services ?? [];
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const chosen = services.filter((x) => serviceIds.includes(x.id));
  const total = chosen.reduce((a, x) => a + Number(x.harga), 0);
  const durasi = chosen.reduce((a, x) => a + Number(x.estimasiMenit), 0);
  const dayList = useMemo(days, []);
  const slots = useMemo(() => slotList(), []);
  const todayYmd = toYMD(new Date());
  const slotOk = (t) => date !== todayYmd || t > jamSekarang();

  const canNext = [
    !!vehicleId,
    serviceIds.length > 0,
    !!date && !!time && slotOk(time),
    true,
  ][step];
  const toggle = (id) =>
    setServiceIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  async function submit() {
    setSaving(true);
    setSubmitError("");
    const body = {
      vehicleId,
      serviceIds,
      bookingDate: date,
      bookingTime: time,
    };
    try {
      const b = editing
        ? await bookingApi.update(editing.id, body)
        : await bookingApi.create(body);
      navigation.replace("BookingDetail", { id: b.id ?? editing.id });
    } catch (e) {
      setSubmitError(errMsg(e, "Gagal menyimpan booking."));
      if (e?.response?.status === 409) setStep(2);
    } finally {
      setSaving(false);
    }
  }

  const back = () => (step > 0 ? setStep(step - 1) : navigation.goBack());

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.ground }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeader
        title={editing ? "Ubah booking" : "Booking baru"}
        subtitle={`Langkah ${step + 1} dari 4 · ${STEPS[step]}`}
        onBack={back}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          paddingHorizontal: 20,
          marginBottom: 8,
        }}
        accessibilityLabel={`Langkah ${step + 1} dari 4`}
      >
        {STEPS.map((x, i) => (
          <View
            key={x}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= step ? colors.amber : colors.line,
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner
          message={error || submitError}
          onRetry={error ? reload : undefined}
        />

        {loading ? (
          <>
            <Skeleton h={80} />
            <Skeleton h={80} />
          </>
        ) : step === 0 ? (
          vehicles.length === 0 ? (
            <Empty
              title="Belum ada kendaraan"
              text="Tambahkan kendaraan dulu untuk membuat booking."
              action={
                <Button
                  title="Tambah kendaraan"
                  onPress={() =>
                    navigation.navigate("Tabs", { screen: "Kendaraan" })
                  }
                />
              }
            />
          ) : (
            <>
              <Text style={s.q}>Kendaraan mana yang mau diservis?</Text>
              {vehicles.map((v) => (
                <Option
                  key={v.id}
                  on={vehicleId === v.id}
                  onPress={() => setVehicleId(v.id)}
                  label={`${v.merk} ${v.tipe} ${v.platNomor}`}
                >
                  <Text
                    style={{
                      fontFamily: font.bodyBold,
                      fontSize: 17,
                      color: colors.ink,
                    }}
                  >
                    {v.merk} {v.tipe}
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.mono,
                      fontSize: 13,
                      color: colors.muted,
                      marginTop: 2,
                    }}
                  >
                    {v.platNomor} · {v.transmisi} · {v.tahun}
                  </Text>
                </Option>
              ))}
            </>
          )
        ) : step === 1 ? (
          services.length === 0 ? (
            <Empty
              title="Layanan belum tersedia"
              text="Bengkel belum menambahkan layanan. Coba lagi nanti."
            />
          ) : (
            <>
              <Text style={s.q}>Pilih layanan (boleh lebih dari satu)</Text>
              {services.map((x) => {
                const on = serviceIds.includes(x.id);
                return (
                  <Option
                    key={x.id}
                    on={on}
                    onPress={() => toggle(x.id)}
                    label={`${x.namaLayanan} ${rupiah(x.harga)}`}
                  >
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: on ? colors.amber : "#CBD5E1",
                          backgroundColor: on ? colors.amber : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        {on ? (
                          <Check
                            size={15}
                            color={colors.night}
                            strokeWidth={3}
                          />
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: font.bodyBold,
                            fontSize: 16,
                            color: colors.ink,
                          }}
                        >
                          {x.namaLayanan}
                        </Text>
                        {x.deskripsi ? (
                          <Text
                            style={{
                              fontFamily: font.body,
                              fontSize: 13,
                              color: colors.muted,
                              marginTop: 2,
                            }}
                          >
                            {x.deskripsi}
                          </Text>
                        ) : null}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: font.mono,
                              fontSize: 12,
                              color: colors.muted,
                            }}
                          >
                            {menit(x.estimasiMenit)}
                          </Text>
                          <Text
                            style={{
                              fontFamily: font.bodyBold,
                              fontSize: 15,
                              color: colors.ink,
                            }}
                          >
                            {rupiah(x.harga)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Option>
                );
              })}
            </>
          )
        ) : step === 2 ? (
          <>
            <Text style={s.q}>Pilih tanggal</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
              {dayList.map((d) => {
                const on = date === d.ymd;
                return (
                  <Pressable
                    key={d.ymd}
                    onPress={() => {
                      setDate(d.ymd);
                      if (time && d.ymd === todayYmd && time <= jamSekarang())
                        setTime(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.hari} ${d.tgl} ${d.bln}`}
                    accessibilityState={{ selected: on }}
                    style={{
                      width: 64,
                      paddingVertical: 12,
                      borderRadius: 16,
                      alignItems: "center",
                      backgroundColor: on ? colors.night : colors.card,
                      borderWidth: 1,
                      borderColor: on ? colors.night : colors.line,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: font.bodySemi,
                        fontSize: 12,
                        color: on ? "#AEB9CC" : colors.muted,
                      }}
                    >
                      {d.today ? "Hari ini" : d.hari}
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.displayBlack,
                        fontSize: 28,
                        color: on ? colors.white : colors.ink,
                        lineHeight: 32,
                      }}
                    >
                      {d.tgl}
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.bodyMedium,
                        fontSize: 11,
                        color: on ? colors.amber : colors.muted,
                      }}
                    >
                      {d.bln}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[s.q, { marginTop: 24 }]}>Pilih jam</Text>
            {!date ? (
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: 14,
                  color: colors.muted,
                }}
              >
                Pilih tanggal dulu.
              </Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {slots.map((t) => {
                  const ok = slotOk(t);
                  const on = time === t;
                  return (
                    <Pressable
                      key={t}
                      disabled={!ok}
                      onPress={() => setTime(t)}
                      accessibilityRole="button"
                      accessibilityLabel={`Jam ${t}`}
                      accessibilityState={{ selected: on, disabled: !ok }}
                      style={{
                        width: "22.5%",
                        minHeight: 48,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: on ? colors.amber : colors.card,
                        borderWidth: 1.5,
                        borderColor: on ? colors.amber : colors.line,
                        opacity: ok ? 1 : 0.35,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font.monoMedium,
                          fontSize: 14,
                          color: on ? colors.night : colors.ink,
                        }}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <Text
              style={{
                fontFamily: font.body,
                fontSize: 12,
                color: colors.muted,
                marginTop: 14,
                lineHeight: 18,
              }}
            >
              Satu jam hanya untuk satu booking. Kalau jam yang kamu pilih sudah
              terisi, kamu akan diminta memilih jam lain.
            </Text>
          </>
        ) : (
          <>
            <Text style={s.q}>Periksa lagi sebelum dikirim</Text>
            <Card>
              <Row
                label="Kendaraan"
                value={vehicle ? `${vehicle.merk} ${vehicle.tipe}` : "-"}
              />
              <Row label="Plat" value={vehicle?.platNomor} mono />
              <Row label="Tanggal" value={tanggal(date)} />
              <Row label="Jam" value={time} mono />
              <Row label="Estimasi" value={menit(durasi)} />
            </Card>
            <Card style={{ marginTop: 12 }}>
              {chosen.map((x) => (
                <Row key={x.id} label={x.namaLayanan} value={rupiah(x.harga)} />
              ))}
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.line,
                  marginVertical: 8,
                }}
              />
              <Row label="Total" value={rupiah(total)} strong />
              <Row
                label="DP 30% (setelah disetujui)"
                value={rupiah(total * 0.3)}
              />
            </Card>
          </>
        )}
      </ScrollView>

      <View
        style={{
          padding: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.ground,
        }}
      >
        {step >= 1 && step < 3 && serviceIds.length > 0 ? (
          <Text
            style={{
              fontFamily: font.bodySemi,
              fontSize: 13,
              color: colors.muted,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {serviceIds.length} layanan · {rupiah(total)} · {menit(durasi)}
          </Text>
        ) : null}
        {step < 3 ? (
          <Button
            title="Lanjut"
            disabled={!canNext || loading}
            onPress={() => setStep(step + 1)}
          />
        ) : (
          <Button
            title={editing ? "Simpan perubahan" : "Kirim booking"}
            onPress={submit}
            loading={saving}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = {
  q: {
    fontFamily: font.bodyBold,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 14,
  },
};
