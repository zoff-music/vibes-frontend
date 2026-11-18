import { m as motion } from 'framer-motion';
import { useId } from 'preact/compat';

export interface WatchPalette {
  sky: string;
  sun: string;
  ring?: boolean;
}

export const watchPalettes: WatchPalette[] = [
  { sky: '#69405e', sun: '#f3b7ab' },
  { sky: '#353575', sun: '#bcb8ff', ring: true },
  { sky: '#285567', sun: '#fbcda9' },
  { sky: '#5b2f63', sun: '#ffd08a' },
];

interface WatchLandscapeProps {
  palette: WatchPalette;
  playing: boolean;
}

export function WatchLandscape({ palette, playing }: WatchLandscapeProps) {
  const gradient = `${useId()}-sky`;

  return (
    <svg
      viewBox="0 0 800 450"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradient} x2="0" y2="1">
          <stop stopColor="#16102c" />
          <stop offset=".7" stopColor={palette.sky} />
          <stop offset="1" stopColor="#ee73aa" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradient})`} d="M0 0h800v450H0z" />
      {[60, 160, 260, 390, 540, 660, 750].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={30 + ((index * 43) % 140)}
          r={index % 2 ? 1.5 : 2}
          fill="#fff"
          opacity=".65"
        />
      ))}
      <motion.g
        animate={{ x: playing ? [0, -18, 0] : 0 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="565" cy="167" r="78" fill={palette.sun} />
        <ellipse
          cx="565"
          cy="170"
          rx="115"
          ry="22"
          fill="none"
          stroke="#e2d4ff"
          strokeWidth="2"
          transform="rotate(-22 565 170)"
          opacity={palette.ring ? 0.8 : 0}
        />
        <path
          d="M-40 360 95 175 245 330 360 205 540 368 690 240 840 330V480H-40Z"
          fill="#342443"
        />
        <path
          d="m95 175 150 155-107-92-43-15-41 22ZM360 205l180 163-150-112-30-8-24 13Z"
          fill="#bb85b5"
          opacity=".5"
        />
      </motion.g>
      <motion.g
        animate={{ x: playing ? [0, 24, 0] : 0 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M-60 410 90 295 245 405 410 315 605 425 750 290 860 390V480H-60Z"
          fill="#151325"
        />
        <path
          d="m-60 410 150-115 155 110 165-90 195 110 145-135 110 100"
          fill="none"
          stroke="#00d9ff"
          strokeWidth="1.5"
          opacity=".5"
        />
      </motion.g>
    </svg>
  );
}
