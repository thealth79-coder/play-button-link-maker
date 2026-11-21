import { getStore } from "@netlify/blobs";
export default async (_req, context) => {
  const slug = String(context.params?.slug || "").toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(slug)) return new Response("Not found",{status:404});
  const store = getStore("play-button-links");
  const [meta, image] = await Promise.all([
    store.get(`link:${slug}`,{type:"json",consistency:"strong"}),
    store.get(`${slug}.jpg`,{type:"arrayBuffer",consistency:"strong"})
  ]);
  if (!meta || !image) return new Response("Not found",{status:404});
  return new Response(image,{headers:{"content-type":"image/jpeg","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});
};
export const config = { path: "/media/:slug" };
