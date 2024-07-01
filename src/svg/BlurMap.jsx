import * as React from "react"
import Svg, { G, Rect, Defs, Pattern, Use, Image } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */ const SvgComponent =
  (props) => (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={342}
      height={295}
      fill="none"
      {...props}
    >
      <G filter="url(#a)">
        <Rect width={342} height={295} fill="url(#b)" rx={20} />
      </G>
      <Defs>
        <Pattern
          id="b"
          width={1}
          height={1}
          patternContentUnits="objectBoundingBox"
        >
          <Use xlinkHref="#c" transform="matrix(.0009 0 0 .00145 -.347 0)" />
        </Pattern>
        <Image
          id="c"
          width={1888}
          height={689}
        />
      </Defs>
    </Svg>
  )
export default SvgComponent