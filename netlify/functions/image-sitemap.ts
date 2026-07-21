import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  const origin = "https://sumanwebdesign.com";
  const images = [
    { loc: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80", title: "Suman Web Design Agency Office" },
    { loc: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", title: "Zari & Silk Luxury Boutique E-Commerce" },
    { loc: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80", title: "Araku Valley Coffee preorder platform" },
    { loc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80", title: "Royal Jodhpur Teak Furniture Showcase" },
    { loc: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80", title: "Vidya Mandir Global Academy Portal" },
    { loc: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80", title: "Healthcare Diagnostics Platform" }
  ];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${origin}</loc>\n`;
  images.forEach(img => {
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${img.loc.replace(/&/g, "&amp;")}</image:loc>\n`;
    xml += `      <image:caption>${img.title}</image:caption>\n`;
    xml += `      <image:title>${img.title}</image:title>\n`;
    xml += `    </image:image>\n`;
  });
  xml += `  </url>\n`;
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
