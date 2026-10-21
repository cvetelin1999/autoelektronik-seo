/**
 * Route-Specific Schema.org JSON-LD Structured Data Engine
 * Aligned verbatim with docs/03-University-SEO-Optimization-Table.md
 * and CSCB700 Academic SEO Requirements.
 */

export interface SchemaNode {
  '@context'?: string;
  '@type': string | string[];
  [key: string]: any;
}

export function getRouteSchema(pathname: string, siteUrl = 'https://autoelektronik-service.bg'): SchemaNode | null {
  // Normalize path by trimming trailing slashes (except root)
  const normalized = pathname.replace(/\/$/, '') || '/';

  switch (normalized) {
    case '/uslugi':
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Сервизни Услуги по Автоелектроника',
        description:
          'Пълен каталог със специализирани услуги за автоелектроника: ремонт на ABS помпи, ECU двигателни компютри, километражни табла и осцилоскопна автодиагностика.',
        url: `${siteUrl}/uslugi/`,
        isPartOf: {
          '@type': 'AutoRepair',
          '@id': `${siteUrl}/#organization`,
          name: 'AutoElektronik',
        },
        hasPart: [
          {
            '@type': 'Service',
            name: 'Ремонт на ABS Модул и Помпа',
            url: `${siteUrl}/uslugi/remont-na-abs-modul/`,
          },
          {
            '@type': 'Service',
            name: 'Ремонт и Клониране на ECU Компютър',
            url: `${siteUrl}/uslugi/remont-na-ecu-kompyutar/`,
          },
          {
            '@type': 'Service',
            name: 'Ремонт на Автомобилни Табла и Дисплеи',
            url: `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/`,
          },
          {
            '@type': 'Service',
            name: 'Компютърна Автодиагностика',
            url: `${siteUrl}/uslugi/avtodiagnostika/`,
          },
        ],
      };

    case '/uslugi/remont-na-abs-modul':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ItemPage',
            '@id': `${siteUrl}/uslugi/remont-na-abs-modul/#webpage`,
            url: `${siteUrl}/uslugi/remont-na-abs-modul/`,
            name: 'Ремонт на ABS Модул и Помпа (Гаранция) | AutoElektronik',
            description:
              'Специализиран лабораторен ремонт и рециклиране на електронни ABS/ESP модули и помпи. Прецизно възстановяване на микробондинг проводници за ATE MK60, Bosch 8.0 и TRW.',
            mainEntity: {
              '@id': `${siteUrl}/uslugi/remont-na-abs-modul/#service`,
            },
          },
          {
            '@type': 'Service',
            '@id': `${siteUrl}/uslugi/remont-na-abs-modul/#service`,
            name: 'Ремонт на ABS Модул и Помпа',
            serviceType: 'Ремонт на автоелектроника',
            description:
              'Лабораторен ремонт и презапояване на прекъснати бондинг връзки в хидравлични и електронни ABS помпи и контролери.',
            provider: {
              '@type': 'AutoRepair',
              '@id': `${siteUrl}/#organization`,
              name: 'AutoElektronik',
            },
            areaServed: 'София, България',
          },
          {
            '@type': 'VideoObject',
            name: 'Процес по рециклиране и диагностика на ABS модул',
            description: 'Лабораторна диагностика и микроелектронно запояване на ABS модули',
            thumbnailUrl: `${siteUrl}/images/video-repair-thumbnail.svg`,
            contentUrl: `${siteUrl}/videos/abs-module-repair-lab.mp4`,
            uploadDate: '2026-03-15',
          },
        ],
      };

    case '/uslugi/remont-na-ecu-kompyutar':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ItemPage',
            '@id': `${siteUrl}/uslugi/remont-na-ecu-kompyutar/#webpage`,
            url: `${siteUrl}/uslugi/remont-na-ecu-kompyutar/`,
            name: 'Ремонт и Клониране на ECU Компютър | AutoElektronik',
            description:
              'Професионален ремонт и клониране на двигателни компютри (ECU / ECM). Подмяна на крайни стъпала, възстановяване след късо съединение и 12 месеца гаранция.',
            mainEntity: {
              '@id': `${siteUrl}/uslugi/remont-na-ecu-kompyutar/#service`,
            },
          },
          {
            '@type': 'Service',
            '@id': `${siteUrl}/uslugi/remont-na-ecu-kompyutar/#service`,
            name: 'Ремонт и Клониране на ECU Компютър',
            serviceType: 'Ремонт на автоелектроника',
            description:
              'Хардуерна диагностика, подмяна на управляващи драйвери за дюзи/бобини и софтуерно клониране на ECU контролери.',
            provider: {
              '@type': 'AutoRepair',
              '@id': `${siteUrl}/#organization`,
              name: 'AutoElektronik',
            },
            areaServed: 'София, България',
          },
        ],
      };

    case '/uslugi/remont-na-avtomobilno-tablo':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ItemPage',
            '@id': `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/#webpage`,
            url: `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/`,
            name: 'Ремонт на Автомобилни Табла и Дисплеи | AutoElektronik',
            description:
              'Професионален ремонт на километражни табла, смяна на лентови кабели и LCD дисплеи, възстановяване на износени стъпкови моторчета за стрелки в София.',
            mainEntity: {
              '@id': `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/#service`,
            },
          },
          {
            '@type': 'Service',
            '@id': `${siteUrl}/uslugi/remont-na-avtomobilno-tablo/#service`,
            name: 'Ремонт на Автомобилни Табла и Дисплеи',
            serviceType: 'Ремонт на автоелектроника',
            description:
              'Смяна на дефектирали LCD/OLED дисплеи, нови лентови кабели и калибриране на стъпкови моторчета на автомобилни табла.',
            provider: {
              '@type': 'AutoRepair',
              '@id': `${siteUrl}/#organization`,
              name: 'AutoElektronik',
            },
            areaServed: 'София, България',
          },
        ],
      };

    case '/uslugi/avtodiagnostika':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ItemPage',
            '@id': `${siteUrl}/uslugi/avtodiagnostika/#webpage`,
            url: `${siteUrl}/uslugi/avtodiagnostika/`,
            name: 'Компютърна Автодиагностика в София | AutoElektronik',
            description:
              'Дълбока компютърна автодиагностика с цифров осцилоскоп в София. Откриване на трудни електронни повреди, проверка на CAN-Bus шини и анализ на сензори в реално време.',
            mainEntity: {
              '@id': `${siteUrl}/uslugi/avtodiagnostika/#service`,
            },
          },
          {
            '@type': 'Service',
            '@id': `${siteUrl}/uslugi/avtodiagnostika/#service`,
            name: 'Компютърна Автодиагностика',
            serviceType: 'Ремонт на автоелектроника',
            description:
              'Осцилоскопен анализ на шини CAN, LIN и FlexRay, диагностика на сензори и откриване на прекъсвания в реално време.',
            provider: {
              '@type': 'AutoRepair',
              '@id': `${siteUrl}/#organization`,
              name: 'AutoElektronik',
            },
            areaServed: 'София, България',
          },
        ],
      };

    case '/otkrii-problema':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            name: 'AutoElektronik Интерактивен Диагностичен Съветник',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'All',
            url: `${siteUrl}/otkrii-problema/`,
            description:
              'Интерактивен софтуерен въпросник за бърза ориентировъчна диагностика на автомобилна електроника по симптоми и OBD кодове.',
          },
          {
            '@type': 'DiagnosticProcedure',
            name: 'Интерактивна диагностична процедура за автомобилна електроника',
            description:
              'Поетапна алгоритмична проверка на симптоми и OBD кодове за грешки при неизправности в електронни блокове.',
          },
        ],
      };

    case '/za-nas':
      return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'За нас — Лабораторен Сервиз | AutoElektronik',
        description:
          'Научи повече за AutoElektronik — лабораторен сервизен център в София, специализиран в рециклиране и ремонт на автомобилни електронни блокове с 12 месеца гаранция.',
        url: `${siteUrl}/za-nas/`,
        mainEntity: {
          '@type': 'AutoRepair',
          '@id': `${siteUrl}/#organization`,
          name: 'AutoElektronik',
          telephone: '+359888123456',
        },
      };

    case '/kontakti':
      return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Контакти и Локация в София | AutoElektronik',
        description:
          'Свържи се с лабораторен сервиз AutoElektronik в София. Адрес: бул. Цариградско шосе №115, телефон: +359 88 812 3456. Google карта с точен пин и форма за запитване.',
        url: `${siteUrl}/kontakti/`,
        mainEntity: {
          '@type': 'AutoRepair',
          '@id': `${siteUrl}/#organization`,
          name: 'AutoElektronik',
          telephone: '+359888123456',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'бул. Цариградско шосе №115',
            addressLocality: 'София',
            postalCode: '1784',
            addressCountry: 'BG',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 42.6617,
            longitude: 23.3853,
          },
        },
      };

    case '/usloviya-za-polzvane':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Условия за ползване | AutoElektronik',
        description:
          'Официални общи условия за ползване на уебсайта и условия за гаранция при извършване на лабораторни ремонти на автомобилна електроника в AutoElektronik.',
        url: `${siteUrl}/usloviya-za-polzvane/`,
      };

    case '/zashtita-na-dannite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Защита на личните данни (GDPR) | AutoElektronik',
        description:
          'Политика за поверителност и защита на личните данни съгласно Регламент (ЕС) 2016/679 (GDPR) на специализиран сервиз за автоелектроника AutoElektronik.',
        url: `${siteUrl}/zashtita-na-dannite/`,
      };

    case '/':
    default:
      // Homepage relies solely on the global AutoRepair + PostalAddress + GeoCoordinates + OpeningHoursSpecification
      return null;
  }
}
