import { getStore } from "@netlify/blobs";

const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" }
});
const allowed = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;
const reserved = new Set(["api","media","admin","login","signup","assets","netlify","functions","favicon.ico","robots.txt","sitemap.xml"]);

export default async (req) => {
  if (req.method !== "POST") return json({error:"POST method required"},405);
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") || "").toLowerCase().trim();
    const url = String(form.get("url") || "").trim();
    const title = String(form.get("title") || "").trim().slice(0,100);
    const description = String(form.get("description") || "").trim().slice(0,180);
    const ratio = String(form.get("ratio") || "16/9");
    const fit = String(form.get("fit") || "contain");
    const playColor = String(form.get("playColor") || "#ffffff");
    const playSize = Math.max(42, Math.min(150, Number(form.get("playSize")) || 76));
    const titleColor = String(form.get("titleColor") || "#172033");
    const titleSize = Math.max(12, Math.min(44, Number(form.get("titleSize")) || 22));
    const image = form.get("image");
    if (!allowed.test(slug) || reserved.has(slug)) return json({error:"এই Custom Link Name ব্যবহার করা যাবে না। অন্য নাম দাও।"},400);
    let dest;
    try { dest = new URL(url); } catch { return json({error:"সঠিক Destination URL দাও।"},400); }
    if (!["http:","https:"].includes(dest.protocol)) return json({error:"শুধু http বা https URL গ্রহণযোগ্য।"},400);
    if (!(image instanceof File) || !["image/jpeg"].includes(image.type)) return json({error:"ছবিটি JPEG হিসেবে আপলোড হয়নি।"},400);
    if (image.size < 100 || image.size > 4_500_000) return json({error:"প্রসেস করা ছবির সাইজ ৪.৫ MB-এর মধ্যে রাখো।"},413);
    if (!["16/9","1/1","4/5","9/16"].includes(ratio) || !["contain","cover"].includes(fit)) return json({error:"ছবির সেটিং সঠিক নয়।"},400);
    if (!/^#[0-9a-fA-F]{6}$/.test(playColor) || !/^#[0-9a-fA-F]{6}$/.test(titleColor)) return json({error:"রঙের মান সঠিক নয়।"},400);

    const store = getStore("play-button-links");
    const metaKey = `link:${slug}`;
    const record = { slug, url: dest.href, title, description, ratio, fit, playColor, playSize, titleColor, titleSize, createdAt: new Date().toISOString() };
    const created = await store.setJSON(metaKey, record, { onlyIfNew: true });
    if (!created.modified) return json({error:"এই নামের লিংক আগে থেকেই আছে। অন্য Custom Name ব্যবহার করো।"},409);
    try {
      await store.set(`${slug}.jpg`, image, { metadata: { contentType:"image/jpeg" } });
    } catch (e) {
      await store.delete(metaKey);
      throw e;
    }
    const origin = new URL(req.url).origin;
    return json({ ok:true, slug, url:`${origin}/${encodeURIComponent(slug)}` });
  } catch (e) {
    console.error("create-link error", e);
    return json({error:"সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করো।"},500);
  }
};

export const config = { path: "/api/create" };
