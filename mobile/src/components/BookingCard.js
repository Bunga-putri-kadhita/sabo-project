import { Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Card, StatusChip } from "./ui";
import { STATUS } from "../utils/status";
import { colors, font } from "../theme";
import { rupiah, tanggal } from "../utils/format";

export function vehicleLabel(v) {
  return v ? `${v.merk} ${v.tipe}` : "Kendaraan";
}

export default function BookingCard({ booking: b, onPress }) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Booking ${b.bookingCode}`}
      style={{
        marginBottom: 12,
        padding: 0,
        overflow: "hidden",
        flexDirection: "row",
      }}
    >
      <View
        style={{
          width: 6,
          backgroundColor: STATUS[b.status]?.dot || colors.amber,
        }}
      />
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: font.monoMedium,
              fontSize: 12,
              color: colors.muted,
            }}
            numberOfLines={1}
          >
            {b.bookingCode}
          </Text>
          <StatusChip status={b.status} />
        </View>
        <Text
          style={{
            fontFamily: font.bodyBold,
            fontSize: 18,
            color: colors.ink,
            marginTop: 10,
          }}
        >
          {vehicleLabel(b.vehicle)}
        </Text>
        <Text
          style={{
            fontFamily: font.mono,
            fontSize: 12,
            color: colors.muted,
            marginTop: 2,
          }}
        >
          {b.vehicle?.platNomor}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: font.bodyMedium,
                fontSize: 13,
                color: colors.muted,
              }}
            >
              Jadwal
            </Text>
            <Text
              style={{
                fontFamily: font.bodySemi,
                fontSize: 15,
                color: colors.ink,
              }}
            >
              {tanggal(b.bookingDate)} · {b.bookingTime}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={{
                fontFamily: font.displayBlack,
                fontSize: 22,
                color: colors.ink,
              }}
            >
              {rupiah(b.totalPrice)}
            </Text>
            <ChevronRight size={18} color={colors.muted} />
          </View>
        </View>
      </View>
    </Card>
  );
}
