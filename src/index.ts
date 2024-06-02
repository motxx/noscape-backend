import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "https://noscape.vercel.app",
        "http://localhost:3000", // XXX: 動作確認用
      ];
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (c) => {
  return c.text("");
});

app.get("/api/oembed", async (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.json({ error: "URL is required" }, 400);
  }

  try {
    const oembedUrl = getOEmbedUrl(url);
    if (!oembedUrl) {
      return c.json({ error: "Unsupported URL" }, 400);
    }

    const response = await fetch(oembedUrl);
    const data = await response.json();
    return c.json(data as Record<string, unknown>);
  } catch (error) {
    return c.json({ error: "Failed to fetch oEmbed data" }, 500);
  }
});

const getOEmbedUrl = (url: string): string | null => {
  if (url.match(/^(https?:\/\/)?(www\.)?(x|twitter)\.com($|\/$|(\/\S*))/)) {
    return `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
  }
  return null;
};

export default app;
