import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://autoelektronik-service.bg';
  const currentDate = new Date().toISOString().split('T')[0];

  const pages = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/uslugi/`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/uslugi/remont-na-abs-modul/`, priority: '0.9', changefreq: 'monthly' },
    { loc: `${siteUrl}/uslugi/remont-na-ecu-kompyutar/`, priority: '0.9', changefreq: 'monthly' },
    { loc: `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/`, priority: '0.9', changefreq: 'monthly' },
    { loc: `${siteUrl}/uslugi/avtodiagnostika/`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${siteUrl}/otkrii-problema/`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/za-nas/`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${siteUrl}/kontakti/`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${siteUrl}/usloviya-za-polzvane/`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${siteUrl}/zashtita-na-dannite/`, priority: '0.3', changefreq: 'yearly' },
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex, follow',
    },
  });
};
