import * as React from "react"
import Svg, {
  SvgProps,
  Circle,
  G,
  Path,
  Defs,
  ClipPath,
  Rect,
} from "react-native-svg"
const SVGComponent = (props) => (
  <Svg
    width={32}
    height={32}
    viewBox='0 0 32 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <Circle opacity={0.74} cx={16} cy={16.0001} r={16} fill='#EFF2F5' />
    <G clipPath='url(#clip0_1496_580)'>
      <Path
        d='M11.94 13.48C10.3243 13.48 9 14.8002 9 16.4116C9 17.036 9.19936 17.6163 9.5369 18.0933L11.5813 21.6274C11.8676 22.0015 12.058 21.9305 12.2962 21.6078L14.551 17.7704C14.5965 17.6878 14.6322 17.6002 14.6634 17.5106C14.8065 17.1619 14.8801 16.7885 14.88 16.4116C14.88 14.8002 13.5562 13.48 11.94 13.48ZM11.94 14.8537C12.8102 14.8537 13.5024 15.544 13.5024 16.4117C13.5024 17.2794 12.8102 17.9695 11.94 17.9695C11.0699 17.9695 10.3776 17.2793 10.3776 16.4117C10.3776 15.544 11.0699 14.8537 11.94 14.8537Z'
        fill='#404080'
      />
      <Path
        d='M21.2851 9C20.3426 9 19.5701 9.77014 19.5701 10.7102C19.5701 11.0744 19.6863 11.4129 19.8832 11.6911L21.0759 13.7527C21.2429 13.9708 21.3539 13.9294 21.4928 13.7412L22.8081 11.5026C22.8347 11.4546 22.8556 11.4035 22.8736 11.3512C22.9571 11.1478 23.0001 10.9301 23.0001 10.7102C23.0001 9.77 22.2278 9 21.2851 9ZM21.2851 9.80136C21.7927 9.80136 22.1965 10.204 22.1965 10.7102C22.1965 11.2163 21.7927 11.6188 21.2851 11.6188C20.7776 11.6188 20.3737 11.2163 20.3737 10.7102C20.3737 10.204 20.7776 9.80136 21.2851 9.80136Z'
        fill='#404080'
      />
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M21.3494 14.2377C21.0348 14.2447 20.7194 14.258 20.4034 14.2814L20.4521 15.0558C20.7556 15.0338 21.0597 15.0197 21.3639 15.0134L21.3494 14.2377ZM19.6729 14.3525C19.1871 14.4128 18.6971 14.4988 18.2127 14.637L18.3951 15.3875C18.8353 15.2621 19.2914 15.181 19.7546 15.1235L19.6729 14.3525ZM17.4873 14.8968C17.3422 14.9609 17.2017 15.0349 17.0668 15.1184L17.0662 15.1191L17.0654 15.1194C16.8729 15.2406 16.67 15.3945 16.5044 15.6181C16.3844 15.7801 16.2863 15.9849 16.2633 16.2271L16.9766 16.3062C16.9819 16.2493 17.0111 16.1743 17.0634 16.1037H17.0637V16.1035C17.1481 15.9892 17.2747 15.8855 17.4252 15.7906L17.4257 15.7903C17.533 15.7241 17.6447 15.6653 17.7601 15.6144L17.4873 14.8968ZM17.1201 16.6517L16.6577 17.2446C16.7673 17.3448 16.8823 17.4218 16.9933 17.4862L16.9947 17.4869L16.9961 17.4878C17.3646 17.6974 17.7445 17.8157 18.0968 17.9279L18.2992 17.1834C17.9471 17.0711 17.6152 16.9628 17.3307 16.8012C17.2492 16.7539 17.1778 16.7045 17.1201 16.6517ZM18.987 17.3929L18.7893 18.1386L18.8829 18.1678L18.9977 18.2044C19.3776 18.3281 19.7416 18.4601 20.067 18.6428L20.3971 17.954C20.0037 17.7329 19.5953 17.5884 19.2018 17.4605L19.2007 17.4602L19.0828 17.4225L18.987 17.3929ZM21.0684 18.4709L20.5612 19.0197C20.681 19.1494 20.7708 19.3055 20.8144 19.4668L20.8147 19.4677L20.815 19.4689C20.8671 19.6572 20.8672 19.8787 20.8265 20.1024L21.5298 20.2525C21.5872 19.9367 21.5965 19.5899 21.5021 19.2476C21.4199 18.9449 21.2631 18.682 21.0684 18.4709ZM20.5809 20.57C20.5034 20.6519 20.4178 20.7256 20.3253 20.7901H20.325C20.073 20.9673 19.7807 21.1009 19.4702 21.2157L19.7017 21.9499C20.0414 21.8243 20.3901 21.6703 20.716 21.441L20.7169 21.4403L20.7173 21.44C20.8511 21.3463 20.9749 21.239 21.0867 21.1198L20.5809 20.57ZM18.8113 21.4225C18.3615 21.5434 17.9017 21.6356 17.4364 21.7137L17.5461 22.4807C18.0251 22.4002 18.506 22.3041 18.9839 22.1755L18.8113 21.4225ZM16.7362 21.8195C16.2678 21.8835 15.7968 21.9357 15.3245 21.9802L15.3864 22.7533C15.866 22.7082 16.3465 22.6552 16.8263 22.5895L16.7362 21.8195ZM14.6145 22.0411C14.1412 22.0787 13.6667 22.1092 13.1919 22.1349L13.2277 22.91C13.7072 22.8841 14.1871 22.8531 14.6669 22.8151L14.6145 22.0411ZM12.4783 22.1699C12.1937 22.1832 11.9083 22.1942 11.6223 22.2042L11.6458 22.98C11.9336 22.9701 12.2214 22.9586 12.5091 22.9455L12.4783 22.1699Z'
        fill='#404080'
      />
    </G>
    <Defs>
      <ClipPath id='clip0_1496_580'>
        <Rect width={14} height={14} fill='white' transform='translate(9 9)' />
      </ClipPath>
    </Defs>
  </Svg>
)
export default SVGComponent