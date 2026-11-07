import { Image, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { brand } from '../ui/theme';

// 화면 상단용 작은 정적 로고: 사용자 제작 필기체 'ticket' + 빨간 밑줄 + 조준 표시(BrandSplash 마지막 프레임과 같은 구성).
// 장식이며 스크린리더에서는 옆의 '티켓레이더' 글자를 읽는다.
const LOGO = require('../../assets/brand/ticket-script.png');
const RATIO = 500 / 1460;

export function BrandMark({ width = 96 }: { width?: number }) {
  const h = width * RATIO;
  // 조준 표시·밑줄은 로고 좌표계(1460×500 + 여백)를 그대로 축소해 그린다.
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: width * 1.04, height: h * 1.22 }}
      testID="brand-mark"
    >
      <Image source={LOGO} style={{ width, height: h }} resizeMode="contain" />
      <Svg style={{ position: 'absolute', left: 0, top: 0 }} width={width * 1.04} height={h * 1.22} viewBox="0 0 1520 610">
        <Path d="M-10,548 Q774,488 1415,437 Q774,506 -10,548 Z" fill={brand.red} />
        <Circle cx={1400} cy={70} r={58} fill="none" stroke={brand.red} strokeWidth={9} />
        <Line x1={1400} y1={12} x2={1400} y2={128} stroke={brand.red} strokeWidth={7} />
        <Line x1={1342} y1={70} x2={1458} y2={70} stroke={brand.red} strokeWidth={7} />
        <Circle cx={1400} cy={70} r={11} fill={brand.red} />
      </Svg>
    </View>
  );
}
