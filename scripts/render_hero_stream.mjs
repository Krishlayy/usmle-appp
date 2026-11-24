import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const FFMPEG_PATH = "C:\\Users\\hello\\AppData\\Local\\Programs\\Python\\Python311\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe";
const OUTPUT_VIDEO = resolve(process.cwd(), 'public/videos/hero-simulator.mp4');
const MOTION_HTML = pathToFileURL(resolve(process.cwd(), 'public/motion/index.html')).href + '?clean=1';

const DURATION_SEC = 18.0;
const FPS = 25;
const TOTAL_FRAMES = Math.round(DURATION_SEC * FPS);
const WIDTH = 1280;
const HEIGHT = 720;

async function main() {
  console.log(`Starting video render: ${TOTAL_FRAMES} frames @ ${FPS}fps (${DURATION_SEC}s) -> ${OUTPUT_VIDEO}`);

  const ffmpeg = spawn(FFMPEG_PATH, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    '-movflags', '+faststart',
    OUTPUT_VIDEO
  ], {
    stdio: ['pipe', 'inherit', 'inherit']
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT }
  });

  await page.goto(MOTION_HTML, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.OPENER && window.OPENER.ready);

  console.log('Opener ready. Stepping through timeline and streaming to FFmpeg...');

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = (i / TOTAL_FRAMES) * DURATION_SEC;
    await page.evaluate((seekTime) => {
      window.OPENER.seek(seekTime);
    }, t);

    const frameBuffer = await page.screenshot({ type: 'jpeg', quality: 92 });

    const ok = ffmpeg.stdin.write(frameBuffer);
    if (!ok) {
      await new Promise(res => ffmpeg.stdin.once('drain', res));
    }

    if (i % 50 === 0 || i === TOTAL_FRAMES - 1) {
      console.log(`Rendered frame ${i + 1}/${TOTAL_FRAMES} (${((i + 1) / TOTAL_FRAMES * 100).toFixed(1)}%) - t=${t.toFixed(2)}s`);
    }
  }

  ffmpeg.stdin.end();
  await browser.close();

  await new Promise((resolvePromise, rejectPromise) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`FFmpeg encoding completed successfully! Output: ${OUTPUT_VIDEO}`);
        resolvePromise();
      } else {
        rejectPromise(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', rejectPromise);
  });
}

main().catch(err => {
  console.error('Video generation error:', err);
  process.exit(1);
});
