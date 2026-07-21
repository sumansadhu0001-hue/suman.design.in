import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  const origin = "https://sumanwebdesign.com";
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `<channel>\n`;
  rss += `  <title>Suman Web Design Agency Insights</title>\n`;
  rss += `  <link>${origin}</link>\n`;
  rss += `  <description>Premium Web Design and Development updates from Suman.design. High performance, SEO optimized, custom handcrafted websites.</description>\n`;
  rss += `  <language>en-us</language>\n`;
  rss += `  <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />\n`;
  rss += `  <item>\n`;
  rss += `    <title>Enterprise Web Design and Custom Website Development Services</title>\n`;
  rss += `    <link>${origin}/services</link>\n`;
  rss += `    <guid>${origin}/services</guid>\n`;
  rss += `    <description>Discover our bespoke, hand-coded web design and development services. Perfect performance, tailored interfaces, and lightning-fast SEO architectural optimization in West Bengal, Kolkata, and Asansol.</description>\n`;
  rss += `    <pubDate>${new Date().toUTCString()}</pubDate>\n`;
  rss += `  </item>\n`;
  rss += `</channel>\n`;
  rss += `</rss>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
      "Access-Control-Allow-Origin": "*",
    },
    body: rss,
  };
};
