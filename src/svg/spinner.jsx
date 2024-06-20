import * as React from "react"
import Svg, { Rect } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: animate */
const Spinner = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={80}
    height={80}
    preserveAspectRatio="xMidYMid"
    style={{
      shapeRendering: "auto",
      display: "block",
      background: "0 0",
    }}
    viewBox="0 0 100 100"
    {...props}
  >
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(30 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(60 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(90 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(120 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(150 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(180 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(210 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(240 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(270 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(300 50 50)"
    ></Rect>
    <Rect
      width={6}
      height={12}
      x={47}
      y={24}
      fill="#118f5e"
      rx={3}
      ry={6}
      transform="rotate(330 50 50)"
    ></Rect>
  </Svg>
)
export default Spinner
