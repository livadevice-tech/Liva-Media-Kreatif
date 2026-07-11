import React, { useState, useEffect } from 'react';

export const CountUp = ({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "", 
  isCurrency = false, 
  decimals = 0 
}: { 
  end: number, 
  duration?: number, 
  prefix?: string, 
  suffix?: string, 
  isCurrency?: boolean, 
  decimals?: number 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(end * easeProgress);
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (isCurrency) {
      return Math.floor(num).toLocaleString('id-ID');
    }
    if (decimals > 0) {
      if (num === 0) return (0).toFixed(decimals).replace('.', ',');
      if (num === end) return end.toFixed(decimals).replace('.', ',');
      return num.toFixed(decimals).replace('.', ',');
    }
    return Math.floor(num).toLocaleString('id-ID');
  };

  return <span>{prefix}{formatNumber(count)}{suffix}</span>;
}
