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
      fillRule="evenodd"
      d="M1.714 16h3.572C6.233 16 7 14.839 7 13.795V2.14C7 1.097 6.233.25 5.286.25H1.714C.768.25 0 1.096 0 2.14v11.655C0 14.84.768 16 1.714 16ZM.301 11.249V7.343l.828-.118v1.61l-.828 2.414Zm1.108-1.706-.674 2.85c2.812 1.003 5.491.014 5.53 0h.001l-.675-2.85H1.41Zm4.453-.814V7.225l.829.116v3.803l-.83-2.415Zm.829-1.964v-3.47l-.83.61V6.65l.83.115ZM6.218 2.31l-.674 1.118H1.362L.688 2.31h5.53ZM1.13 6.646V4.01L.3 3.4v3.365l.83-.12Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default SvgComponent
