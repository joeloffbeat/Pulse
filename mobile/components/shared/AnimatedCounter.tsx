import React, { useEffect, useRef } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
}

export function AnimatedCounter({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  decimals = 2,
  style,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    previousValue.current = value;
  }, [value, duration, animatedValue]);

  const displayValue = animatedValue.interpolate({
    inputRange: [0, value || 1],
    outputRange: [0, value],
    extrapolate: 'clamp',
  });

  return (
    <AnimatedText
      value={displayValue}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      style={style}
    />
  );
}

interface AnimatedTextProps {
  value: Animated.AnimatedInterpolation<number>;
  prefix: string;
  suffix: string;
  decimals: number;
  style?: TextStyle;
}

function AnimatedText({ value, prefix, suffix, decimals, style }: AnimatedTextProps) {
  const [displayText, setDisplayText] = React.useState('0');

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      setDisplayText(Number(v).toFixed(decimals));
    });
    return () => value.removeListener(id);
  }, [value, decimals]);

  return (
    <Text style={style}>
      {prefix}{displayText}{suffix}
    </Text>
  );
}
