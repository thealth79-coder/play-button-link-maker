import { getStore } from "@netlify/blobs";
const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const notFound = () => new Response("এই লিংকটি পাওয়া যায়নি।", {status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
export default async (req, context) => {
  const slug = String(context.params?.slug || "").toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(slug)) return notFound();
  const store = getStore("play-button-links");
  const data = await store.get(`link:${slug}`, {type:"json", consistency:"strong"});
  if (!data) return notFound();
  const origin = new URL(req.url).origin;
  const imageUrl = `${origin}/media/${encodeURIComponent(slug)}`;
  const title = data.title || "ছবি দেখুন";
  const description = data.description || title;
  const html = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(origin+"/"+slug)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${esc(imageUrl)}"><meta property="og:image:width" content="1920"><meta property="og:image:height" content="1080"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(imageUrl)}"><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#f4f6f8;color:#172033;font-family:Arial,sans-serif}.wrap{width:100%;max-width:1100px;margin:auto}.visual{position:relative;width:100%;aspect-ratio:${data.ratio};background:#fff;overflow:hidden}.visual img{width:100%;height:100%;object-fit:${data.fit};display:block}.go{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none}.play{width:${data.playSize}px;height:${data.playSize}px;border-radius:50%;background:${esc(data.playColor)};color:#17243a;display:grid;place-items:center;padding-left:5px;font:30px Arial,sans-serif;box-shadow:0 4px 24px #0008;border:2px solid white}.title{margin:12px 0 4px;text-align:center;font-size:${data.titleSize}px;color:${esc(data.titleColor)};font-weight:700;overflow-wrap:anywhere}@media(max-width:600px){.play{width:min(16vw,60px);height:min(16vw,60px);font-size:24px}.title{font-size:min(5vw,18px)}}</style></head><body><main class="wrap"><div class="visual"><img src="${esc(imageUrl)}" alt="${esc(title)}"><a class="go" href="${esc(data.url)}" target="_blank" rel="noopener noreferrer" aria-label="লিংক খুলুন"><span class="play">▶</span></a></div>${data.title?`<h1 class="title">${esc(data.title)}</h1>`:""}</main></body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=60, s-maxage=300"}});
};
export const config = { path: "/:slug" };
