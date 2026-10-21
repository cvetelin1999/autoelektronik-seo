import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://autoelektronik-seo.tsvetelin-takiev.workers.dev';

  const videoEntries = [
    {
      pageUrl: `${siteUrl}/uslugi/remont-na-abs-modul/`,
      thumbnailLoc: `${siteUrl}/images/video-repair-thumbnail.svg`,
      title: 'Как се ремонтира и рециклира дефектирал ABS / ESP модул',
      description: 'Лабораторна видео демонстрация: процес по отваряне, преглед под микроскоп и микрозапояване на прекъснати бондинг проводници при автомобилен ABS модул ATE MK60.',
      contentLoc: `${siteUrl}/videos/abs-module-repair-lab.mp4`,
      playerLoc: `${siteUrl}/uslugi/remont-na-abs-modul/`,
      duration: 275, // 04:35 in seconds
      publicationDate: '2026-10-20T10:00:00+02:00',
      familyFriendly: 'yes',
      tag: ['ремонт на ABS', 'автоелектроника', 'ATE MK60', 'микрозапояване', 'диагностика'],
    },
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries
  .map(
    (v) => `  <url>
    <loc>${v.pageUrl}</loc>
    <video:video>
      <video:thumbnail_loc>${v.thumbnailLoc}</video:thumbnail_loc>
      <video:title><![CDATA[${v.title}]]></video:title>
      <video:description><![CDATA[${v.description}]]></video:description>
      <video:content_loc>${v.contentLoc}</video:content_loc>
      <video:player_loc allow_embed="yes">${v.playerLoc}</video:player_loc>
      <video:duration>${v.duration}</video:duration>
      <video:publication_date>${v.publicationDate}</video:publication_date>
      ${v.tag.map((t) => `<video:tag><![CDATA[${t}]]></video:tag>`).join('\n      ')}
      <video:family_friendly>${v.familyFriendly}</video:family_friendly>
    </video:video>
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
