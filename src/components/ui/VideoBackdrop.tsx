import { AutoPlayVideo } from './AutoPlayVideo';

/**
 * Full-viewport looping video behind page content. Fixed, non-interactive, softened by a
 * white wash so foreground text always passes contrast. If the video cannot load, the soft
 * gradient underneath is all that shows.
 */
export function VideoBackdrop({ src = '/videos/hero-simulator.mp4' }: { src?: string }) {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50">
      <AutoPlayVideo
        src={src}
        preload="auto"
        showFallback={false}
        className="h-full w-full scale-105 object-cover opacity-30 blur-[3px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white" />
    </div>
  );
}
