import { getStore } from "@netlify/blobs";
import sharp from "sharp";

const notFound = () => new Response("Not found", { status: 404 });

export default async (_req, context) => {
  const slug = String(context.params?.slug || "").toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(slug)) return notFound();

  const store = getStore("play-button-links");
  const [meta, image] = await Promise.all([
    store.get(`link:${slug}`, { type: "json", consistency: "strong" }),
    store.get(`${slug}.jpg`, { type: "arrayBuffer", consistency: "strong" })
  ]);
  if (!meta || !image) return notFound();

  try {
    const source = Buffer.from(image);
    const info = await sharp(source).metadata();
    const width = info.width || 1080;
    const height = info.height || 1080;

    // Keep the play button visually prominent at Facebook's large preview size.
    const baseSize = Math.max(42, Math.min(150, Number(meta.playSize) || 76));
    const diameter = Math.round(baseSize * (width > 1100 ? width / 1100 : 1));
    const cx = width / 2;
    const cy = height / 2;
    const radius = diameter / 2;
    const playColor = /^#[0-9a-fA-F]{6}$/.test(meta.playColor || "") ? meta.playColor : "#ffffff";
    const triangle = [
      `${cx - diameter * 0.13},${cy - diameter * 0.27}`,
      `${cx - diameter * 0.13},${cy + diameter * 0.27}`,
      `${cx + diameter * 0.31},${cy}`
    ].join(" ");

    const overlay = Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="${Math.max(3, diameter * 0.07)}"/>
            <feOffset dy="${Math.max(2, diameter * 0.035)}"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${playColor}" fill-opacity="0.97" stroke="#ffffff" stroke-width="${Math.max(3, diameter * 0.035)}" filter="url(#shadow)"/>
        <polygon points="${triangle}" fill="#17243a"/>
      </svg>
    `);

    const output = await sharp(source)
      .composite([{ input: overlay, left: 0, top: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer();

    return new Response(output, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    console.error("og image generation error", error);
    return new Response("Could not generate preview image", { status: 500 });
  }
};

export const config = { path: "/og/:slug" };
