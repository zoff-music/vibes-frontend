import { classNames } from '@vibes/shared';
import { useGenerativeParticles } from '../hooks/useGenerativeParticles';
import { SparklesIcon } from '../icons';

interface GenerativeParticlesProps {
  enabled: boolean;
}

export function GenerativeParticles({ enabled }: GenerativeParticlesProps) {
  const { particles, remove } = useGenerativeParticles(enabled);
  return (
    <span
      aria-hidden="true"
      className="generative-particles pointer-events-none absolute inset-x-0 bottom-full mb-px h-10 overflow-hidden motion-reduce:hidden"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          onAnimationEnd={() => remove(particle.id)}
          className={classNames(
            'absolute -bottom-4 opacity-0 will-change-transform [animation-fill-mode:both]',
            particle.position,
            particle.size,
            particle.speed,
            particle.path,
            particle.color,
          )}
        >
          {particle.icon === 2 && <SparklesIcon className="size-full" />}
          {particle.icon !== 2 && (
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
              {particle.icon === 0 && (
                <path d="M10 2h4v5h3v3h5v4h-5v3h-3v5h-4v-5H7v-3H2v-4h5V7h3z" />
              )}
              {particle.icon === 1 && (
                <path d="M12 2h4v2h4v4h-4v10h-2v2H8v-2H6v-4h2v-2h4z" />
              )}
              {particle.icon === 3 && (
                <path d="M8 4h12v14h-2v2h-4v-2h-2v-4h2v-2h2V8h-4v12h-2v2H6v-2H4v-4h2v-2h2z" />
              )}
            </svg>
          )}
        </span>
      ))}
    </span>
  );
}
