import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill="#BDBDBD"
      d="M6 1C3.245 1 1 3.245 1 6s2.245 5 5 5 5-2.245 5-5-2.245-5-5-5Zm2.175 6.785a.373.373 0 0 1-.515.13L6.11 6.99c-.385-.23-.67-.735-.67-1.18V3.76c0-.205.17-.375.375-.375s.375.17.375.375v2.05c0 .18.15.445.305.535l1.55.925a.37.37 0 0 1 .13.515Z"
    />
  </Svg>
)
export default SvgComponent
