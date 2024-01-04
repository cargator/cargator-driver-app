import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M14.644 28.633C7.733 30.945 2.5 36.422 2.5 45c0 10.313 8.438 17.5 18.75 17.5h28.808M73.097 59.022c2.722-2.256 4.403-5.645 4.403-10.272 0-9.347-8.281-13.4-15-13.75C61.11 21.01 51.406 12.5 40 12.5c-4.087 0-7.623 1.083-10.563 2.834"
        stroke="#464E5F"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M70 70L10 10"
        stroke="#464E5F"
        strokeWidth={5}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
