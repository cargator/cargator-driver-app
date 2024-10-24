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
      d="M1.465 1.516A4.914 4.914 0 0 1 5 0c1.326 0 2.598.546 3.536 1.516A5.273 5.273 0 0 1 10 5.178c0 1.373-.527 2.69-1.464 3.66L5 12.5 1.465 8.839A5.193 5.193 0 0 1 .38 7.159a5.338 5.338 0 0 1 0-3.963 5.193 5.193 0 0 1 1.084-1.68ZM5 6.656c.379 0 .742-.155 1.01-.432.268-.278.419-.654.419-1.046 0-.393-.151-.769-.419-1.046A1.404 1.404 0 0 0 5 3.698c-.379 0-.742.156-1.01.434a1.506 1.506 0 0 0-.418 1.046c0 .392.15.768.418 1.046.268.277.631.433 1.01.433Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default SvgComponent
