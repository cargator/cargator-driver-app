import * as React from 'react';
import Svg, {Circle} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Circle cx={14} cy={14} r={14} fill="#F2F3F7" />
      <Circle cx={14} cy={14} r={8} fill="#404080" />
    </Svg>
  );
}

export default SvgComponent;
