import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

const Spinner = props => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1600, // 1 second for a full rotation
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{transform: [{rotate: spin}]}}>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={80}
        height={80}
        preserveAspectRatio="xMidYMid"
        style={{
          shapeRendering: 'auto',
          display: 'block',
          background: '0 0',
        }}
        viewBox="0 0 100 100"
        {...props}>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#389e75"
          rx={3}
          ry={6}></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#44a77f"
          rx={3}
          ry={6}
          transform="rotate(30 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#51b48c"
          rx={3}
          ry={6}
          transform="rotate(60 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#5dc199"
          rx={3}
          ry={6}
          transform="rotate(90 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#6acba4"
          rx={3}
          ry={6}
          transform="rotate(120 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#78d6b0"
          rx={3}
          ry={6}
          transform="rotate(150 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#7dd6b2"
          rx={3}
          ry={6}
          transform="rotate(180 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#89dcbb"
          rx={3}
          ry={6}
          transform="rotate(210 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#8cd8ba"
          rx={3}
          ry={6}
          transform="rotate(240 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#98dcc1"
          rx={3}
          ry={6}
          transform="rotate(270 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#a0dcc4"
          rx={3}
          ry={6}
          transform="rotate(300 50 50)"></Rect>
        <Rect
          width={6}
          height={12}
          x={47}
          y={24}
          fill="#aae1cb"
          rx={3}
          ry={6}
          transform="rotate(330 50 50)"></Rect>
      </Svg>
    </Animated.View>
  );
};

export default Spinner;
