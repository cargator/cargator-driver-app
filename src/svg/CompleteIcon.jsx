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
      <G filter="url(#filter0_d_140_1685)">
        <Circle cx={31} cy={31} r={25} fill="#fff" />
        <Circle cx={31} cy={31} r={24.5} stroke="#404080" />
      </G>
      <Path
        d="M30.713 37.75l-7.38-7.623 1.891-1.54 4.268 3.4c1.749-2.113 5.631-6.303 10.988-9.636l.451 1.056C36.015 27.994 31.99 34.45 30.713 37.75zm9.248-8.967a9.235 9.235 0 11-5.399-6.339v-1.287a10.412 10.412 0 00-3.577-.63c-5.762 0-10.432 4.671-10.432 10.433 0 5.761 4.67 10.431 10.432 10.431 5.761 0 10.431-4.67 10.431-10.431 0-.747-.078-1.475-.227-2.177H39.96z"
        fill="#404080"
      />
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
