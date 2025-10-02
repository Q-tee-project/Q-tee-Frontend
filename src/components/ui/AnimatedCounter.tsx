'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

// AnimatedCounter Component
const AnimatedCounter = ({ value, suffix = '' }: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [count, value]);

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
