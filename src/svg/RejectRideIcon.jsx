import * as React from 'react';
import Svg, {Circle, G, Path, Defs, ClipPath} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Circle
        cx={24}
        cy={24}
        r={23.52}
        fill="#fff"
        stroke="#EB5757"
        strokeWidth={0.96}
      />
      <G clipPath="url(#clip0_314_2296)">
        <Path
          d="M35.52 24.023c0 2.089-.515 4.017-1.544 5.783a11.438 11.438 0 01-4.193 4.193c-1.766 1.03-3.694 1.544-5.783 1.544-2.089 0-4.017-.515-5.783-1.544a11.438 11.438 0 01-4.193-4.193c-1.03-1.766-1.544-3.694-1.544-5.783 0-2.089.514-4.017 1.544-5.783a11.438 11.438 0 014.193-4.193c1.766-1.03 3.694-1.544 5.783-1.544 2.089 0 4.017.515 5.783 1.544a11.438 11.438 0 014.193 4.193c1.03 1.766 1.544 3.694 1.544 5.783zm-7.81 5.345l1.635-1.636-3.71-3.709 3.71-3.71-1.636-1.635L24 22.388l-3.71-3.71-1.635 1.636 3.71 3.709-3.71 3.71 1.636 1.635L24 25.658l3.71 3.71z"
          fill="#EB5757"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_314_2296">
          <Path
            fill="#fff"
            transform="translate(12.48 12.48)"
            d="M0 0H23.04V23.04H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
