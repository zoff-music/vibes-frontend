import { useLocation } from 'react-router';
import { useThemeStore } from '../../stores/themeStore';

export function Background() {
  const location = useLocation();
  const isWarping = useThemeStore((state) => state.isWarping);

  // Only show the sun on Home and CreateRoom pages
  const showSun =
    location.pathname === '/' || location.pathname === '/rooms/create';

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 animate-[gradientShift_12s_ease-in-out_infinite] bg-[length:180%_180%] bg-[linear-gradient(120deg,var(--synth-sky-1),var(--synth-sky-2),var(--synth-sky-3),var(--synth-sky-4))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,var(--synth-haze-1),transparent_55%),radial-gradient(circle_at_80%_10%,var(--synth-haze-2),transparent_50%)] opacity-[0.65]" />
      <div className="vhs-scanlines absolute inset-0" />

      {showSun && (
        <div className="absolute top-[clamp(2rem,6vh,4rem)] left-1/2 h-[clamp(14rem,30vw,18rem)] w-[clamp(14rem,30vw,18rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_35%,var(--sunset-core),var(--sunset-mid)_50%,var(--sunset-glow)_75%,transparent_85%)] [filter:drop-shadow(0_0_50px_rgba(255,120,160,0.7))] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] after:absolute after:inset-[58%_0%_auto_0%] after:h-[28%] after:bg-[linear-gradient(rgba(15,5,30,0.9),rgba(15,5,30,0.9)),linear-gradient(rgba(15,5,30,0.8),rgba(15,5,30,0.8)),linear-gradient(rgba(15,5,30,0.7),rgba(15,5,30,0.7)),linear-gradient(rgba(15,5,30,0.6),rgba(15,5,30,0.6))] after:bg-no-repeat after:opacity-[0.65] after:content-[''] after:[background-position:center_15px,center_32px,center_52px,center_75px] after:[background-size:95%_4px,90%_4.5px,82%_5px,70%_6px]" />
      )}

      <div
        className={`absolute bottom-0 left-1/2 h-[100vh] w-[200%] origin-bottom bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(255,105,180,0)_0px,rgba(255,105,180,0.45)_1px,rgba(255,105,180,0)_2px),linear-gradient(to_bottom,rgba(0,217,255,0)_0px,rgba(0,217,255,0.45)_1px,rgba(0,217,255,0)_2px)] transition-[opacity,filter] duration-500 [backface-visibility:hidden] [mask-image:linear-gradient(to_top,black_30%,transparent_95%)] [transform:translateX(-50%)_perspective(600px)_rotateX(60deg)] [will-change:transform,background-position] ${
          isWarping
            ? 'animate-[retroGridScroll_80ms_linear_infinite] opacity-100 [filter:drop-shadow(0_0_40px_rgba(255,46,151,0.9))]'
            : 'animate-[retroGridScroll_2s_linear_infinite] opacity-80 [filter:drop-shadow(0_0_25px_rgba(255,46,151,0.5))]'
        }`}
      />
    </div>
  );
}
