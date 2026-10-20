import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://autoelektronik-service.bg';

  const imageEntries = [
    {
      pageUrl: `${siteUrl}/`,
      imageUrl: `${siteUrl}/images/hero-car-electronics.svg`,
      title: 'Схема на автомобилна електроника, компютърни блокове за управление и CAN-Bus мрежа',
      caption: 'Диагностика и лабораторен ремонт на компютри и модули за автомобилна електроника в София',
    },
    {
      pageUrl: `${siteUrl}/uslugi/remont-na-abs-modul/`,
      imageUrl: `${siteUrl}/images/service-abs.svg`,
      title: 'Схема на микрозапояване на бондинг проводници в електронен ABS модул',
      caption: 'Лабораторно рециклиране и микрозапояване на бондинг нишки в ABS модули ATE MK60 и Bosch 8.0',
    },
    {
      pageUrl: `${siteUrl}/uslugi/remont-na-ecu-kompyutar/`,
      imageUrl: `${siteUrl}/images/service-ecu.svg`,
      title: 'Стенд за диагностика и клониране на микропроцесори в ECU двигателен компютър',
      caption: 'Компонентен ремонт на двигателни компютри Bosch MED17, EDC17, Delphi и клониране',
    },
    {
      pageUrl: `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/`,
      imageUrl: `${siteUrl}/images/service-tablo.svg`,
      title: 'Ремонт и калибриране на скоростомер и LCD дисплей на автомобилно табло',
      caption: 'Смяна на лентови кабели, пиксели и стъпкови моторчета на автомобилни табла',
    },
    {
      pageUrl: `${siteUrl}/uslugi/avtodiagnostika/`,
      imageUrl: `${siteUrl}/images/service-diag.svg`,
      title: 'Осцилоскопна форма на сигнала при диагностика на CAN-Bus автомобилна шина',
      caption: 'Дълбочинен осцилоскопен анализ на сензори и високоскоростна CAN мрежа',
    },
    {
      pageUrl: `${siteUrl}/za-nas/`,
      imageUrl: `${siteUrl}/images/service-lab.svg`,
      title: 'Лабораторна поялна станция JBC и осцилоскоп за ремонт на автоелектроника',
      caption: 'Професионално лабораторно оборудване за компонентен ремонт на автоелектроника',
    },
    {
      pageUrl: `${siteUrl}/za-nas/`,
      imageUrl: `${siteUrl}/images/author-certification.svg`,
      title: 'Сертификат за стандарт IPC-7711 и 12 месеца писмена гаранция от AutoElektronik',
      caption: 'Стандартизиран сервизен процес за ремонт на електронни модули с писмена гаранция',
    },
    {
      pageUrl: `${siteUrl}/otkrii-problema/`,
      imageUrl: `${siteUrl}/images/diagnostic-flow.svg`,
      title: 'Интерактивна блок-схема на диагностичния въпросник за автомобилна електроника',
      caption: '3-стъпков алгоритъм за бързо разпознаване на електронни повреди по симптоми',
    },
    {
      pageUrl: `${siteUrl}/kontakti/`,
      imageUrl: `${siteUrl}/images/map-location.svg`,
      title: 'Локация на сервиз за автоелектроника AutoElektronik на бул. Цариградско шосе София',
      caption: 'Карта на сервизната лаборатория с удобен достъп и паркинг в гр. София',
    },
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.pageUrl}</loc>
    <image:image>
      <image:loc>${entry.imageUrl}</image:loc>
      <image:title><![CDATA[${entry.title}]]></image:title>
      <image:caption><![CDATA[${entry.caption}]]></image:caption>
    </image:image>
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
