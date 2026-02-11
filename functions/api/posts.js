export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 100);
  const channel = "marketiqai";

  // Simple in-memory aggregation across pages via ?before=...
  let posts = [];
  let before = null;

  // Helpers
  const stripHtml = (html) =>
    (html || "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/p\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n+/g, "\n\n")
      .trim();

  const parsePage = (html) => {
    const items = [];
    // Match message containers
    const reMsg = /<div class="tgme_widget_message[^"]*"[^>]*data-post="([^"]+)"[\s\S]*?<time[^>]*datetime="([^"]+)"[^>]*>[\s\S]*?<\/time>[\s\S]*?(?:<div class="tgme_widget_message_text[^"]*">([\s\S]*?)<\/div>)?/g;
    let m;
    while ((m = reMsg.exec(html)) !== null) {
      const dataPost = m[1]; // e.g. marketiqai/123
      const dt = m[2];
      const textHtml = m[3] || "";
      const idMatch = /\/(\d+)$/.exec(dataPost);
      const id = idMatch ? parseInt(idMatch[1], 10) : null;
      if (!id) continue;

      // views (optional): find closest views span after this match region (best-effort)
      const tail = html.slice(m.index, m.index + 2000);
      const viewsMatch = /<span class="tgme_widget_message_views[^"]*">\s*([^<]+)\s*<\/span>/.exec(tail);
      const views = viewsMatch ? stripHtml(viewsMatch[1]) : null;

      const text = stripHtml(textHtml);
      const url = `https://t.me/${channel}/${id}`;
      items.push({ id, date: dt, text, url, views });
    }

    // before id: find the smallest id on page (oldest) and use it as next before
    const ids = items.map(i => i.id).sort((a,b)=>a-b);
    const nextBefore = ids.length ? ids[0] : null;
    return { items, nextBefore };
  };

  // Fetch up to 6 pages (usually enough for 100)
  for (let i=0; i<6 && posts.length < limit; i++) {
    const pageUrl = before
      ? `https://t.me/s/${channel}?before=${before}`
      : `https://t.me/s/${channel}`;
    const resp = await fetch(pageUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; CloudflarePages/1.0; +https://pages.cloudflare.com/)"
      }
    });
    if (!resp.ok) break;
    const html = await resp.text();
    const parsed = parsePage(html);
    if (!parsed.items.length) break;

    // Merge, de-dup
    for (const it of parsed.items) {
      if (!posts.find(p => p.id === it.id)) posts.push(it);
      if (posts.length >= limit) break;
    }

    // next page
    if (!parsed.nextBefore || parsed.nextBefore === before) break;
    before = parsed.nextBefore;
  }

  // Sort newest first
  posts.sort((a,b)=>b.id - a.id);

  const body = JSON.stringify({
    channel: "marketiqai",
    count: posts.slice(0, limit).length,
    posts: posts.slice(0, limit)
  });

  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=300"
    }
  });
}
