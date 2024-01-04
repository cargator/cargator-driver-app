import * as React from 'react';
import Svg, {Circle} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Circle opacity={0.74} cx={20} cy={20} r={20} fill="#EFF2F5" />
      <Circle cx={20} cy={20} r={8} fill="#fff" />
      <Circle cx={20.0001} cy={20} r={4.57143} fill="#404080" />
    </Svg>
  );
}

export default SvgComponent;
