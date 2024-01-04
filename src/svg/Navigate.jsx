import * as React from 'react';
import Svg, {G, Circle, Path, Defs} from 'react-native-svg';
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
      <G filter="url(#filter0_d_91_1437)">
        <Circle cx={31} cy={31} r={25} fill="#fff" />
        <Circle cx={31} cy={31} r={24.5} stroke="#404080" />
      </G>
      <Path
        d="M31.812 41.563a.813.813 0 01-.812-.834v-9.316a.406.406 0 00-.407-.406H21.27a.829.829 0 01-.786-.541.812.812 0 01.427-1.01l19.5-8.944a.812.812 0 011.078 1.076l-8.938 19.5a.812.812 0 01-.739.474z"
        fill="#404080"
      />
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
