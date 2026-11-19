const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const assets = path.join(__dirname, '..', 'assets');
const background = '#1b1b1b';
const backgroundByte = 27;
const canvas = { width: 2400, height: 1600, channels: 3, background };
const center = { x: 1200, y: 590 };
const tolerance = 0.03;

// Count the visible artwork on the final background, including holes in the silhouette
// only when they actually differ from that background.
function measure({ data, info }) {
  let left = info.width, right = -1, top = info.height, bottom = -1;
  let area = 0;
  let nonBackground = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 3;
      const r = Math.abs(data[i] - backgroundByte);
      const g = Math.abs(data[i + 1] - backgroundByte);
      const b = Math.abs(data[i + 2] - backgroundByte);
      if (r + g + b === 0) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      nonBackground++;
      if (Math.round(0.299 * r + 0.587 * g + 0.114 * b) >= 12) area++;
    }
  }
  if (!nonBackground) throw new Error('The logo is empty on the card background.');
  return { area: area || nonBackground, box: { left, top, width: right-left+1, height: bottom-top+1 } };
}

async function readMark(file) {
  const meta = await sharp(file).metadata();
  const options = meta.format === 'svg'
    ? { density: Math.min(100000, Math.max(1, Math.ceil(72 * canvas.width / Math.max(meta.width, meta.height)))) }
    : {};
  const rgb = await sharp(file, options).toColourspace('srgb').flatten({ background })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { box, area } = measure(rgb);
  const pixels = await sharp(rgb.data, { raw: rgb.info }).extract(box).png().toBuffer();
  return { pixels, width: box.width, height: box.height, area };
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node render.cjs <preset or image path> <output.png>');
  const steam = await readMark(path.join(assets, 'steam.png'));
  const presets = await fs.readdir(assets);
  const file = presets.includes(input + '.png') ? path.join(assets, input + '.png') : input;
  const mark = input === 'steam' ? steam : await readMark(file);
  const ratio = mark.area / steam.area;
  const desired = Math.abs(ratio - 1) <= tolerance ? 1 : Math.sqrt(1 / ratio);
  const fit = Math.min((canvas.width - 2) / mark.width, (2 * center.y - 2) / mark.height);
  let scale = Math.min(desired, fit);
  let markImage, width, height;
  for (let attempt = 0; attempt < 3; attempt++) {
    width = Math.max(1, Math.round(mark.width * scale));
    height = Math.max(1, Math.round(mark.height * scale));
    const rendered = await sharp(mark.pixels).resize(width, height, { fit: 'fill' })
      .raw().toBuffer({ resolveWithObject: true });
    const visible = measure(rendered);
    markImage = await sharp(rendered.data, { raw: rendered.info }).extract(visible.box).png().toBuffer();
    width = visible.box.width;
    height = visible.box.height;
    const actualRatio = visible.area / steam.area;
    if (Math.abs(actualRatio - 1) <= tolerance) break;
    const next = Math.min(scale / Math.sqrt(actualRatio), fit);
    if (next === scale || attempt === 2) {
      console.error('Visible area is ' + Math.round(actualRatio * 100) + '% of Steam at the fitted size.');
      break;
    }
    scale = next;
  }
  const left = Math.round(center.x - width / 2);
  const top = Math.round(center.y - height / 2);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp({ create: canvas }).composite([{ input: markImage, left, top }])
    .flatten({ background }).png().toFile(output);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
