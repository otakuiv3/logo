const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const assets = path.join(__dirname, '..', 'assets');
const canvas = { width: 2400, height: 1600, channels: 3, background: '#1b1b1b' };
const size = 900;

async function customMark(file) {
  const metadata = await sharp(file).metadata();
  let density = 72;
  if (metadata.format === 'svg') {
    density = Math.max(1, Math.ceil(72 * size * 2 / Math.max(metadata.width, metadata.height)));
  }
  const raster = await sharp(file, { density }).ensureAlpha().png().toBuffer();
  const cropped = await sharp(raster).trim({ background: '#00000000', threshold: 1 }).png().toBuffer();
  return sharp(cropped).resize(size, size, { fit: 'inside' }).png().toBuffer();
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node render.cjs <preset or image path> <output.png>');
  const preset = input + '.png';
  const known = await fs.readdir(assets);
  const mark = known.includes(preset) ? await fs.readFile(path.join(assets, preset)) : await customMark(input);
  const { width } = await sharp(mark).metadata();
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp({ create: canvas })
    .composite([{ input: mark, left: Math.round((canvas.width - width) / 2), top: 140 }])
    .flatten({ background: canvas.background }).png().toFile(output);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
