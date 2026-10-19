import { useEffect, useRef, useState } from 'preact/compat';

const positions = [
  'left-[18%]',
  'left-[27%]',
  'left-[36%]',
  'left-[45%]',
  'left-[54%]',
  'left-[63%]',
  'left-[72%]',
  'left-[81%]',
  'left-[90%]',
];
const sizes = ['size-3', 'size-3.5', 'size-4', 'size-5'];
const speeds = [
  '[animation-duration:1.7s]',
  '[animation-duration:2.1s]',
  '[animation-duration:2.6s]',
];
const paths = [
  'animate-generative-particle-left',
  'animate-generative-particle-right',
  'animate-generative-particle-rise',
];
const colors = ['text-primary', 'text-secondary'];

interface GenerativeParticle {
  id: number;
  icon: number;
  position: string;
  size: string;
  speed: string;
  path: string;
  color: string;
}

function pick(values: string[]): string {
  return values[Math.floor(Math.random() * values.length)];
}

export function useGenerativeParticles(enabled: boolean) {
  const [particles, setParticles] = useState<GenerativeParticle[]>([]);
  const sequence = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setParticles([]);
      return;
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number;
    let previousPosition = -3;
    let previousIcon = -1;
    const emit = () => {
      const available = positions.filter(
        (_, index) => Math.abs(index - previousPosition) > 1,
      );
      const position = pick(available);
      previousPosition = positions.indexOf(position);
      const icon = (previousIcon + 1 + Math.floor(Math.random() * 3)) % 4;
      previousIcon = icon;
      const particle: GenerativeParticle = {
        id: sequence.current++,
        icon,
        position,
        size: pick(sizes),
        speed: pick(speeds),
        path: pick(paths),
        color: pick(colors),
      };
      setParticles((current) =>
        current.length < 3 ? [...current, particle] : current,
      );
      timer = window.setTimeout(emit, 450 + Math.random() * 850);
    };
    const restart = () => {
      window.clearTimeout(timer);
      setParticles([]);
      if (!motion.matches)
        timer = window.setTimeout(emit, 100 + Math.random() * 350);
    };
    restart();
    motion.addEventListener('change', restart);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener('change', restart);
    };
  }, [enabled]);

  const remove = (id: number) =>
    setParticles((current) => current.filter((particle) => particle.id !== id));
  return { particles, remove };
}
