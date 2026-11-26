import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Car, LayoutGrid, User, Wrench } from "lucide-react-native";
import { colors, font } from "../theme";

const icons = {
  Beranda: LayoutGrid,
  Layanan: Wrench,
  Kendaraan: Car,
  Booking: Calendar,
  Profil: User,
};

export default function FloatingTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const Icon = icons[route.name] || LayoutGrid;
        const color = focused ? colors.amberDeep : "#5B6477";

        const onPress = () => {
          const e = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={route.name}
            accessibilityState={{ selected: focused }}
            style={s.item}
          >
            <Icon size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            <Text
              style={[
                s.label,
                {
                  color,
                  fontFamily: focused ? font.bodyBold : font.bodyMedium,
                },
              ]}
            >
              {route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E5E0",
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 10.5,
  },
});
