declare module 'react-native-confetti-cannon' {
  import { Component, RefObject } from 'react';
  import { ViewStyle } from 'react-native';

  interface ConfettiCannonProps {
    count?: number;
    origin?: { x: number; y: number };
    explosionSpeed?: number;
    fallSpeed?: number;
    fadeOut?: boolean;
    autoStart?: boolean;
    colors?: string[];
    onAnimationStart?: () => void;
    onAnimationResume?: () => void;
    onAnimationStop?: () => void;
    onAnimationEnd?: () => void;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {
    start: () => void;
    stop: () => void;
    resume: () => void;
  }
}
