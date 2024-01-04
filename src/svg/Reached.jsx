import * as React from 'react';
import Svg, {G, Circle, Defs} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props) {
  return (
    <Svg
      width={62}
      height={62}
      viewBox="0 0 62 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G filter="url(#filter0_d_140_1517)">
        <Circle cx={31} cy={31} r={25} fill="#fff" />
        <Circle cx={31} cy={31} r={24.5} stroke="#404080" />
      </G>
      <Circle cx={31} cy={31} r={10} fill="#EFF2F5" />
      <Circle cx={31.0004} cy={31.0001} r={5.71429} fill="#404080" />
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
