import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  const origin = "https://sumanwebdesign.com";
  const pages = [
    { loc: "", changefreq: "daily", priority: "1.0" },
    { loc: "/services", changefreq: "weekly", priority: "0.9" },
    { loc: "/work", changefreq: "weekly", priority: "0.8" },
    { loc: "/pricing", changefreq: "weekly", priority: "0.8" },
    { loc: "/contact", changefreq: "monthly", priority: "0.7" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
    { loc: "/cookie", changefreq: "yearly", priority: "0.3" },
    { loc: "/refund", changefreq: "yearly", priority: "0.3" }
  ];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  pages.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${origin}${p.loc}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  xml += `</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
      "Access-Control-Allow-Origin": "*",
    },
    body: xml,
  };
};
