import * as React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Circle opacity={0.74} cx={14} cy={14} r={14} fill="#EFF2F5" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.228 10.668a3.92 3.92 0 115.544 5.544L14 18.984l-2.772-2.772a3.92 3.92 0 010-5.544zM14 14.56a1.12 1.12 0 100-2.24 1.12 1.12 0 000 2.24z"
        fill="#2F80ED"
      />
    </Svg>
  );
}

export default SvgComponent;
