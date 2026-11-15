'use strict';
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');

async function render() {
  const [input, label, output, ...flags] = process.argv.slice(2);
  if (!input || !label || !output || flags.some(flag => !['--1x', '--wordmark'].includes(flag))) {
    throw new Error('Usage: node render.cjs logo.svg "Brand" output.png [--wordmark] [--1x]');
  }
  const scale = flags.includes('--1x') ? 1 : 2;
  const wordmark = flags.includes('--wordmark');
  const width = 1200 * scale;
  const height = 800 * scale;
  const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#0b0b0b"/><rect x="2" y="2" width="1196" height="796" rx="72" fill="#1b1b1b" stroke="#242426" stroke-width="4"/></svg>`);
  const art = await fs.readFile(input);
  const info = await sharp(art).metadata();
  const fitWidth = (wordmark ? 820 : 350) * scale;
  const fitHeight = (wordmark ? 450 : 350) * scale;
  const ratio = Math.min(fitWidth / info.width, fitHeight / info.height);
  if (info.format !== 'svg' && (!info.hasAlpha || ratio > 1.01)) {
    throw new Error('Use a transparent raster at the placement size or a vector mark.');
  }
  const density = info.format === 'svg' ? Math.max(72, Math.ceil(72 * ratio)) : 72;
  const sized = await sharp(art, {density}).resize(fitWidth, fitHeight, {fit:'inside'}).ensureAlpha().png().toBuffer({resolveWithObject:true});
  const mark = await sharp({create:{width:sized.info.width, height:sized.info.height, channels:4, background:'#d1d1d1'}})
    .composite([{input:sized.data, blend:'dest-in'}]).png().toBuffer();
  const layers = [{input:mark, left:Math.round((width-sized.info.width)/2), top:Math.round((wordmark ? 400 : 320)*scale-sized.info.height/2)}];
  if (!wordmark) {
    const escaped = label.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const fontfile = path.resolve(__dirname,'../assets/Alexandria.ttf');
    let title = await sharp({text:{text:`<span foreground="#f5f6fc">${escaped}</span>`, font:`Alexandria ${60*scale}`, fontfile, rgba:true, dpi:72}}).png().toBuffer({resolveWithObject:true});
    if (title.info.width > 1050*scale) {
      title = await sharp(title.data).resize({width:1050*scale}).png().toBuffer({resolveWithObject:true});
    }
    layers.push({input:title.data, left:Math.round((width-title.info.width)/2), top:590*scale});
  }
  await fs.mkdir(path.dirname(path.resolve(output)), {recursive:true});
  await sharp(frame).composite(layers).flatten({background:'#0b0b0b'}).png().toFile(output);
  console.log(path.resolve(output));
}
render().catch(error => { console.error(error.message); process.exitCode=1; });
