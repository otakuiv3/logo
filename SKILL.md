---
name: logo
description: إنشاء وإرسال صورة بطاقة لوغو لأي منصة أو لعبة أو خدمة، بنفس ستايل بطاقات ستيم وLagoFast الرصاصية. استخدمه لطلبات مثل «دزلي لوكو دسكورد»، «سويلي بطاقة بلايستيشن»، أو اسم علامة وحده ضمن سلسلة بطاقات. لا ينطبق على تصميم هوية جديدة أو تعديل واجهة المتجر.
---

Create the user's dark G2 logo card as a standalone, flattened PNG. The default is 2400 × 1600, exactly twice the layout of [the Steam reference](assets/reference-steam.png). Use the bundled renderer and Alexandria font.

1. Resolve the brand and its usual English spelling. A list requests one card per item in the given order. If a transliteration could identify different brands, clarify that item while preparing the others. «لوكو فاست» means LagoFast for this user.
2. Look in `assets/marks` first. Use `xbox.svg` with the label GAME PASS for Game Pass, `lagofast.svg` for LagoFast, and the full `league-wordmark.svg` in wordmark mode for League of Legends. For new brands, use the supplied artwork or obtain a clean vector from the brand's media kit or a reputable icon collection. Preserve the precise silhouette, cutouts and aspect ratio. If only a raster exists, use a transparent source at least as large as its placed dimensions. Prefer a vector source to enlarging a favicon. For multi-colour marks that depend on contrasting interior details, choose a monochrome variant with explicit cutouts. A generic category such as VPN can use a clear category icon.
3. Run the script with the paths resolved for the current machine. Write only the requested cards to the user's output directory. In tlestore use `output/g2-topup-icons/`. On a fresh installation run `npm ci --prefix "<skill>"` once. Then run from any directory:

   `node "<skill>/scripts/render.cjs" "<logo.svg>" "Brand Name" "<output>/brand-card.png"`

   For a full wordmark that already spells out the name, append `--wordmark` to center the lettering without a duplicate caption. Use `--1x` for the original 1200 × 800 export if requested. Otherwise use the HD default. Use a new filename for an alternate version.
4. Check the exported image for clarity, logo identity and a legible caption. Embed each PNG separately in the chat using its absolute path. An export request does not need a storefront edit.
