import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../theme";

function gearPath(cx, cy, teeth, rOuter, rInner) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const w = step * 0.26;
    const b = step * 0.4;
    [
      [a - b, rInner],
      [a - w, rOuter],
      [a + w, rOuter],
      [a + b, rInner],
    ].forEach(([ang, r]) =>
      pts.push(
        `${(cx + r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`,
      ),
    );
  }
  return `M${pts.join("L")}Z`;
}

const PATH = gearPath(100, 100, 16, 96, 79);
const HOLES = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (i * Math.PI) / 3;
  return [100 + 46 * Math.cos(a), 100 + 46 * Math.sin(a)];
});

// Roda gigi yang berputar pelan. Berhenti kalau pengguna mengaktifkan "kurangi gerakan".
export default function GearDial({
  size = 200,
  color = colors.amber,
  stroke = 2.2,
  opacity = 1,
  seconds = 48,
  style,
}) {
  const v = useRef(new Animated.Value(0)).current;
  const [still, setStill] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setStill)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (still) return undefined;
    const a = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: seconds * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    a.start();
    return () => a.stop();
  }, [v, seconds, still]);

  const rotate = v.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width: size, height: size, opacity, transform: [{ rotate }] },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Path
          d={PATH}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <Circle
          cx="100"
          cy="100"
          r="66"
          fill="none"
          stroke={color}
          strokeOpacity={0.28}
          strokeWidth={1.5}
        />
        <Circle
          cx="100"
          cy="100"
          r="22"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
        />
        {HOLES.map(([x, y], i) => (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r="7"
            fill="none"
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
