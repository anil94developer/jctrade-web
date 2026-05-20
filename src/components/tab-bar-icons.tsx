import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color: string };

/** Stroke-only icons — reliable on Android Chrome mobile web (no icon fonts / no emoji tofu). */
export function TabIconHome({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H5a1 1 0 0 1-1-1v-9.5z"
      />
    </Svg>
  );
}

/** Left ↔ right arrows (sell / exchange). */
export function TabIconSell({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8 3 4 7l4 4" />
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="m16 21 4-4-4-4" />
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M20 17H4" />
    </Svg>
  );
}

export function TabIconUpi({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M6 13h6M14 17h4" />
    </Svg>
  );
}

/** Simple headset band + ear cups — support. */
export function TabIconSupport({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        d="M7 14Q12 8 17 14"
      />
      <Rect x={3} y={13} width={5} height={7} rx={1.5} stroke={color} strokeWidth={2} />
      <Rect x={16} y={13} width={5} height={7} rx={1.5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function TabIconProfile({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        d="M5 21v-2a7 7 0 0114 0v2"
      />
    </Svg>
  );
}
