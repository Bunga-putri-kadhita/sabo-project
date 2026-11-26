import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  Banknote,
  Landmark,
  MessageCircle,
  Pencil,
  QrCode,
  Star,
  Trash2,
} from "lucide-react-native";
import { bookingApi, paymentApi, reviewApi } from "../api/data";
import { errMsg } from "../api/client";
import useLoad from "../hooks/useLoad";
import { vehicleLabel } from "../components/BookingCard";
import GearDial from "../components/GearDial";
import {
  Button,
  Card,
  ConfirmSheet,
  ErrorBanner,
  FadeIn,
  Field,
  Pill,
  Row,
  Screen,
  ScreenHeader,
  SectionTitle,
  Sheet,
  Skeleton,
  StatusChip,
  Stepper,
} from "../components/ui";
import { colors, font } from "../theme";
import { menit, rupiah, tanggal, waktuWIB } from "../utils/format";
import { METODE, PAY_STATUS, PETUNJUK, STATUS } from "../utils/status";

const METHODS = [
  {
    key: "QRIS",
    icon: QrCode,
    title: "QRIS",
    sub: "Bayar dari e-wallet atau m-banking",
  },
  {
    key: "TRANSFER",
    icon: Landmark,
    title: "Transfer",
    sub: "Kasir memverifikasi setelah kamu bayar",
  },
  {
    key: "CASH",
    icon: Banknote,
    title: "Tunai",
    sub: "Bayar langsung di kasir bengkel",
  },
];

function PaySheet({ visible, onClose, kind, amount, bookingId, onDone }) {
  const [method, setMethod] = useState("CASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    console.log("ID booking saat membuat pembayaran:", bookingId);
    
    try {
      const payment =
        kind === "dp"
          ? await paymentApi.payDp(bookingId, method)
          : await paymentApi.paySettlement(bookingId, method);
      onDone(payment);
    } catch (e) {
      setError(errMsg(e, "Gagal membuat pembayaran."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={kind === "dp" ? "Bayar DP" : "Bayar pelunasan"}
    >
      <Text
        style={{
          fontFamily: font.displayBlack,
          fontSize: 42,
          color: colors.ink,
          marginBottom: 4,
        }}
      >
        {rupiah(amount)}
      </Text>
      <Text
        style={{
          fontFamily: font.body,
          fontSize: 14,
          color: colors.muted,
          marginBottom: 16,
        }}
      >
        Pilih metode pembayaran
      </Text>
      <ErrorBanner message={error} />
      {METHODS.map((m) => {
        const on = method === m.key;
        const Icon = m.icon;
        return (
          <Pressable
            key={m.key}
            onPress={() => setMethod(m.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${m.title}. ${m.sub}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 14,
              borderRadius: 16,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: on ? colors.amber : colors.line,
              backgroundColor: on ? "#FFFBEB" : colors.card,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: on ? colors.amber : "#EFEDE7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} color={colors.night} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: font.bodyBold,
                  fontSize: 16,
                  color: colors.ink,
                }}
              >
                {m.title}
              </Text>
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  color: colors.muted,
                }}
              >
                {m.sub}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <Button
        title="Buat tagihan"
        onPress={pay}
        loading={busy}
        style={{ marginTop: 6 }}
      />
    </Sheet>
  );
}

function ReviewSheet({ visible, onClose, bookingId, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!rating) return setError("Pilih jumlah bintang dulu.");
    setBusy(true);
    setError("");
    try {
      await reviewApi.create({ bookingId, rating, comment: comment.trim() });
      onDone();
    } catch (e) {
      setError(errMsg(e, "Gagal mengirim ulasan."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Beri ulasan">
      <ErrorBanner message={error} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
          marginBottom: 18,
        }}
        accessibilityRole="radiogroup"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => setRating(n)}
            accessibilityRole="radio"
            accessibilityLabel={`${n} bintang`}
            accessibilityState={{ selected: rating === n }}
            hitSlop={4}
          >
            <Star
              size={42}
              color={colors.amber}
              fill={n <= rating ? colors.amber : "transparent"}
              strokeWidth={1.8}
            />
          </Pressable>
        ))}
      </View>
      <Field
        label="Ceritakan pengalamanmu (opsional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        maxLength={500}
        style={{ marginBottom: 16 }}
      />
      <Button title="Kirim ulasan" onPress={send} loading={busy} />
    </Sheet>
  );
}

function PayRow({ title, payment, amount }) {
  const st = payment ? PAY_STATUS[payment.status] : null;
  return (
    <View style={{ paddingVertical: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontFamily: font.bodySemi, fontSize: 15, color: colors.ink }}
        >
          {title}
        </Text>
        <Text
          style={{ fontFamily: font.bodyBold, fontSize: 15, color: colors.ink }}
        >
          {rupiah(payment ? payment.amount : amount)}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          marginTop: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {st ? (
          <Pill label={st.label} fg={st.fg} bg={st.bg} />
        ) : (
          <Pill label="Belum ditagih" />
        )}
        {payment?.method ? <Pill label={METODE[payment.method]} /> : null}
        {payment?.paidAt ? (
          <Text
            style={{ fontFamily: font.mono, fontSize: 11, color: colors.muted }}
          >
            {waktuWIB(payment.paidAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function BookingDetailScreen({ navigation, route }) {
  const { id } = route.params;
  // Dimuat ulang tiap 15 detik supaya perubahan status dari bengkel langsung terlihat.
  const { data, loading, error, refreshing, refresh, reload } = useLoad(
    async () => {
      const [booking, payments] = await Promise.all([
        bookingApi.get(id),
        paymentApi.list(id),
      ]);
      return { booking, payments };
    },
    15000,
  );
  const [pay, setPay] = useState(null);
  const [qrisPayment, setQrisPayment] = useState(null);
  const [qrisData, setQrisData] = useState(null);
  const [qrisError, setQrisError] = useState("");
  const [qrisBusy, setQrisBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let active = true;
    if (!qrisPayment?.id) {
      setQrisData(null);
      setQrisError("");
      return undefined;
    }
    setQrisData(null);
    setQrisError("");
    paymentApi
      .getQris(qrisPayment.id)
      .then((result) => {
        if (active) setQrisData(result);
      })
      .catch((e) => {
        if (active) setQrisError(errMsg(e, "Gagal memuat QR pembayaran."));
      });
    return () => {
      active = false;
    };
  }, [qrisPayment?.id]);

  async function simulateQris() {
    if (!qrisPayment?.id) return;
    setQrisBusy(true);
    setQrisError("");
    try {
      await paymentApi.simulateQris(qrisPayment.id);
      setQrisPayment(null);
      setQrisData(null);
      await reload();
    } catch (e) {
      setQrisError(errMsg(e, "Simulasi pembayaran gagal."));
    } finally {
      setQrisBusy(false);
    }
  }

  const b = data?.booking;
  const payments = data?.payments ?? [];
  const dp = payments.find((p) => p.type === "DP");
  const pel = payments.find((p) => p.type === "PELUNASAN");
  const total = Number(b?.totalPrice) || 0;
  const dpAmount = dp ? Number(dp.amount) : Math.round(total * 0.3);
  const pelAmount = pel ? Number(pel.amount) : total - Math.round(total * 0.3);

  const canPayDp =
    b?.status === "APPROVED" &&
    (!dp || dp.status === "FAILED" || dp.status === "EXPIRED");
  const canPayPel = b?.status === "SELESAI" && pel && pel.status !== "PAID";
  const waiting = [dp, pel].find(
    (p) =>
      p &&
      p.status === "PENDING" &&
      p.method &&
      (p.type === "DP" || b?.status === "SELESAI"),
  );
  const mins = (b?.bookingDetails ?? []).reduce(
    (a, d) => a + Number(d.service?.estimasiMenit || 0),
    0,
  );

  async function cancel() {
    setCancelling(true);
    setCancelError("");
    try {
      await bookingApi.cancel(id);
      setCancelOpen(false);
      navigation.goBack();
    } catch (e) {
      setCancelError(errMsg(e, "Gagal membatalkan booking."));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Screen
      onRefresh={refresh}
      refreshing={refreshing}
      footer={
        canPayDp || canPayPel ? (
          <View
            style={{
              padding: 16,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.line,
              backgroundColor: colors.ground,
            }}
          >
            <Button
              title={
                canPayDp
                  ? `Bayar DP ${rupiah(dpAmount)}`
                  : `Bayar pelunasan ${rupiah(pelAmount)}`
              }
              onPress={() => setPay(canPayDp ? "dp" : "settlement")}
            />
          </View>
        ) : null
      }
      header={
        <ScreenHeader
          title="Detail booking"
          subtitle={b?.bookingCode}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <ErrorBanner message={error} onRetry={reload} />
      {loading || !b ? (
        <>
          <Skeleton h={150} />
          <Skeleton h={200} />
        </>
      ) : (
        <>
          <FadeIn>
            <Card
              dark
              style={{ padding: 20, overflow: "hidden", borderRadius: 24 }}
            >
              <GearDial
                size={130}
                opacity={0.22}
                stroke={1.5}
                style={{ position: "absolute", right: -46, top: -52 }}
              />
              <View style={{ flexDirection: "row", marginBottom: 18 }}>
                <StatusChip status={b.status} />
              </View>
              <Stepper status={b.status} dark />
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: 14,
                  color: "#CBD5E1",
                  marginTop: 16,
                  lineHeight: 20,
                }}
              >
                {STATUS[b.status]?.hint}
              </Text>
            </Card>
          </FadeIn>

          <SectionTitle>Servis</SectionTitle>
          <Card>
            <Row label="Kendaraan" value={vehicleLabel(b.vehicle)} />
            <Row label="Plat" value={b.vehicle?.platNomor} mono />
            <Row
              label="Jadwal"
              value={`${tanggal(b.bookingDate)} · ${b.bookingTime}`}
            />
            <Row label="Estimasi" value={menit(mins)} />
            <Row
              label="Mekanik"
              value={b.mechanic?.namaMekanik || "Belum ditugaskan"}
            />
          </Card>

          <SectionTitle>Layanan</SectionTitle>
          <Card>
            {b.bookingDetails.map((d) => (
              <Row
                key={d.id}
                label={d.service?.namaLayanan}
                value={rupiah(d.price)}
              />
            ))}
            <View
              style={{
                height: 1,
                backgroundColor: colors.line,
                marginVertical: 8,
              }}
            />
            <Row label="Total" value={rupiah(b.totalPrice)} strong />
          </Card>

          {b.status !== "PENDING" ? (
            <>
              <SectionTitle>Pembayaran</SectionTitle>
              <Card>
                <PayRow title="DP (30%)" payment={dp} amount={dpAmount} />
                <View style={{ height: 1, backgroundColor: colors.line }} />
                <PayRow
                  title="Pelunasan (70%)"
                  payment={pel}
                  amount={pelAmount}
                />

                {waiting ? (
                  <View
                    style={{
                      backgroundColor: "#FFFBEB",
                      borderRadius: 14,
                      padding: 14,
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: "#FDE68A",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: font.bodyBold,
                        fontSize: 14,
                        color: "#92400E",
                      }}
                    >
                      Langkah berikutnya
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: 13.5,
                        color: "#78350F",
                        marginTop: 4,
                        lineHeight: 20,
                      }}
                    >
                      {PETUNJUK[waiting.method]}
                    </Text>
                    {waiting.method !== "QRIS" ? (
                      <View
                        style={{
                          marginTop: 12,
                          backgroundColor: colors.white,
                          borderRadius: 12,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: "#FDE68A",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: font.bodySemi,
                            fontSize: 12,
                            color: "#78350F",
                          }}
                        >
                          Sebutkan ID booking ini ke kasir
                        </Text>
                        <Text
                          style={{
                            fontFamily: font.displayBlack,
                            fontSize: 44,
                            lineHeight: 48,
                            color: colors.ink,
                          }}
                        >
                          {b.id}
                        </Text>
                        <Text
                          style={{
                            fontFamily: font.mono,
                            fontSize: 12,
                            color: colors.muted,
                          }}
                        >
                          {b.bookingCode}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </Card>

              {qrisPayment ? (
                <Card style={{ marginTop: 12, alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: font.bodyBold,
                      fontSize: 17,
                      color: colors.ink,
                      marginBottom: 6,
                    }}
                  >
                    QRIS SABO (SIMULASI)
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.body,
                      fontSize: 13,
                      color: colors.muted,
                      textAlign: "center",
                      marginBottom: 14,
                    }}
                  >
                    QR dummy untuk pengujian. Tidak menerima uang sungguhan.
                  </Text>
                  {qrisData?.qrPayload ? (
                    <View style={{ padding: 12, backgroundColor: "#FFFFFF", borderRadius: 12 }}>
                      <QRCode value={qrisData.qrPayload} size={210} />
                    </View>
                  ) : (
                    <Text style={{ color: colors.muted, padding: 20 }}>
                      {qrisError || "Menyiapkan QR..."}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontFamily: font.displayBlack,
                      fontSize: 27,
                      color: colors.ink,
                      marginTop: 14,
                    }}
                  >
                    {rupiah(qrisPayment.amount)}
                  </Text>
                  <ErrorBanner message={qrisError} />
                  {qrisData?.simulationEnabled ? (
                    <Button
                      title="Simulasikan pembayaran berhasil"
                      onPress={simulateQris}
                      loading={qrisBusy}
                      style={{ marginTop: 14, width: "100%" }}
                    />
                  ) : (
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: 12,
                        color: colors.muted,
                        textAlign: "center",
                        marginTop: 12,
                      }}
                    >
                      Mode simulasi belum diaktifkan pada server.
                    </Text>
                  )}
                </Card>
              ) : null}

            </>
          ) : null}}

          <View style={{ marginTop: 20, gap: 10 }}>
            <Button
              title="Chat dengan bengkel"
              variant="dark"
              onPress={() =>
                navigation.navigate("Chat", {
                  bookingId: b.id,
                  code: b.bookingCode,
                })
              }
              icon={<MessageCircle size={18} color={colors.white} />}
            />

            {b.status === "SELESAI" ? (
              b.review ? (
                <Card>
                  <Text
                    style={{
                      fontFamily: font.bodySemi,
                      fontSize: 13,
                      color: colors.muted,
                      marginBottom: 6,
                    }}
                  >
                    Ulasanmu
                  </Text>
                  <View style={{ flexDirection: "row", gap: 3 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={20}
                        color={colors.amber}
                        fill={
                          n <= b.review.rating ? colors.amber : "transparent"
                        }
                      />
                    ))}
                  </View>
                  {b.review.comment ? (
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: 14,
                        color: colors.ink,
                        marginTop: 8,
                        lineHeight: 20,
                      }}
                    >
                      {b.review.comment}
                    </Text>
                  ) : null}
                </Card>
              ) : (
                <Button
                  title="Beri ulasan"
                  onPress={() => setReviewOpen(true)}
                  icon={<Star size={18} color={colors.night} />}
                />
              )
            ) : null}

            {b.status === "PENDING" ? (
              <>
                <Button
                  title="Ubah booking"
                  variant="ghost"
                  onPress={() =>
                    navigation.navigate("NewBooking", { booking: b })
                  }
                  icon={<Pencil size={17} color={colors.ink} />}
                />
                <Button
                  title="Batalkan booking"
                  variant="danger"
                  onPress={() => {
                    setCancelError("");
                    setCancelOpen(true);
                  }}
                  icon={<Trash2 size={17} color={colors.danger} />}
                />
              </>
            ) : null}
          </View>
        </>
      )}

      <PaySheet
        visible={!!pay}
        kind={pay}
        amount={pay === "dp" ? dpAmount : pelAmount}
        bookingId={id}
        onClose={() => setPay(null)}
        onDone={(payment) => {
          setPay(null);
          if (payment?.method === "QRIS" && payment?.status === "PENDING") {
            setQrisPayment(payment);
          }
          reload();
        }}
      />
      <ReviewSheet
        visible={reviewOpen}
        bookingId={id}
        onClose={() => setReviewOpen(false)}
        onDone={() => {
          setReviewOpen(false);
          reload();
        }}
      />
      <ConfirmSheet
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan booking?"
        text={`Booking ${b?.bookingCode ?? ""} akan dihapus dan jadwalnya dibuka untuk orang lain.${cancelError ? `\n\n${cancelError}` : ""}`}
        confirmLabel="Ya, batalkan"
        onConfirm={cancel}
        loading={cancelling}
      />
    </Screen>
  );
}
