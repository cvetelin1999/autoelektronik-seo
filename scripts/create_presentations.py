import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN

# Color Palette
BG_COLOR = RGBColor(248, 250, 252)        # Slate 50
CARD_BG = RGBColor(255, 255, 255)         # Pure White
CARD_BORDER = RGBColor(226, 232, 240)     # Slate 200
PRIMARY = RGBColor(30, 58, 138)           # Brand Blue 900
ACCENT = RGBColor(2, 132, 199)            # Sky Blue 600
TEXT_MAIN = RGBColor(15, 23, 42)          # Slate 900
TEXT_MUTED = RGBColor(71, 85, 105)        # Slate 600
TEXT_LIGHT = RGBColor(148, 163, 184)      # Slate 400

def set_slide_base(slide, prs):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = ACCENT
    top_bar.line.fill.background()

def add_header(slide, title_text, category_text="CSCB700 • Оптимизация за търсачки в уеб"):
    header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
    tf = header_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_cat = tf.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = ACCENT
    
    p_title = tf.add_paragraph()
    p_title.text = title_text
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = PRIMARY
    p_title.space_before = Pt(4)

def add_footer(slide):
    footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.7), Inches(0.4))
    tf = footer_box.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "AutoElektronik — Лабораторен сервиз за автоелектроника | Преподавател: Елисавета Тричкова-Кашъмова"
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_LIGHT

def add_grid_cards(slide, cards_data, cols=2):
    n = len(cards_data)
    if cols == 2:
        rows = (n + 1) // 2
        card_w = Inches(5.6)
        card_h = Inches(2.3) if rows == 2 else Inches(1.5)
        start_y = Inches(1.7)
        gap_x = Inches(0.5)
        gap_y = Inches(0.3)
        
        for i, item in enumerate(cards_data):
            row = i // 2
            col = i % 2
            x = Inches(0.8) + col * (card_w + gap_x)
            y = start_y + row * (card_h + gap_y)
            
            shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, card_w, card_h)
            shape.fill.solid()
            shape.fill.fore_color.rgb = CARD_BG
            shape.line.color.rgb = CARD_BORDER
            shape.line.width = Pt(1.5)
            
            tf = shape.text_frame
            tf.word_wrap = True
            tf.margin_left = Inches(0.25)
            tf.margin_top = Inches(0.2)
            tf.margin_right = Inches(0.25)
            tf.margin_bottom = Inches(0.2)
            
            title, desc = item
            p0 = tf.paragraphs[0]
            p0.text = title
            p0.font.bold = True
            p0.font.size = Pt(15)
            p0.font.color.rgb = PRIMARY
            
            if isinstance(desc, list):
                for bullet in desc:
                    pb = tf.add_paragraph()
                    pb.text = "• " + bullet
                    pb.font.size = Pt(12)
                    pb.font.color.rgb = TEXT_MUTED
                    pb.space_before = Pt(4)
            else:
                p1 = tf.add_paragraph()
                p1.text = desc
                p1.font.size = Pt(13)
                p1.font.color.rgb = TEXT_MUTED
                p1.space_before = Pt(6)

    elif cols == 3:
        card_w = Inches(3.6)
        card_h = Inches(4.7)
        start_y = Inches(1.7)
        gap_x = Inches(0.4)
        
        for i, item in enumerate(cards_data):
            x = Inches(0.8) + i * (card_w + gap_x)
            y = start_y
            
            shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, card_w, card_h)
            shape.fill.solid()
            shape.fill.fore_color.rgb = CARD_BG
            shape.line.color.rgb = CARD_BORDER
            shape.line.width = Pt(1.5)
            
            tf = shape.text_frame
            tf.word_wrap = True
            tf.margin_left = Inches(0.25)
            tf.margin_top = Inches(0.25)
            tf.margin_right = Inches(0.25)
            tf.margin_bottom = Inches(0.25)
            
            title, desc = item
            p0 = tf.paragraphs[0]
            p0.text = title
            p0.font.bold = True
            p0.font.size = Pt(16)
            p0.font.color.rgb = PRIMARY
            
            if isinstance(desc, list):
                for bullet in desc:
                    pb = tf.add_paragraph()
                    pb.text = "• " + bullet
                    pb.font.size = Pt(12)
                    pb.font.color.rgb = TEXT_MUTED
                    pb.space_before = Pt(8)
            else:
                p1 = tf.add_paragraph()
                p1.text = desc
                p1.font.size = Pt(13)
                p1.font.color.rgb = TEXT_MUTED
                p1.space_before = Pt(10)

def create_title_slide(prs, subtitle_tag, title_text):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(slide, prs)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.2), Inches(10.9), Inches(5.1))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = CARD_BORDER
    card.line.width = Pt(1.5)
    
    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.8)
    tf.margin_top = Inches(0.8)
    tf.margin_right = Inches(0.8)
    
    p0 = tf.paragraphs[0]
    p0.text = subtitle_tag.upper()
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT
    
    p1 = tf.add_paragraph()
    p1.text = title_text
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY
    p1.space_before = Pt(12)
    
    p_meta = tf.add_paragraph()
    p_meta.text = "Проект: AutoElektronik (https://autoelektronik-service.bg)"
    p_meta.font.size = Pt(14)
    p_meta.font.bold = True
    p_meta.font.color.rgb = TEXT_MAIN
    p_meta.space_before = Pt(28)
    
    p_course = tf.add_paragraph()
    p_course.text = "Дисциплина: CSCB700 — Оптимизация за търсачки в уеб (SEO)\nНов български университет"
    p_course.font.size = Pt(13)
    p_course.font.color.rgb = TEXT_MUTED
    p_course.space_before = Pt(6)
    
    p_lect = tf.add_paragraph()
    p_lect.text = "Преподавател: Елисавета Тричкова-Кашъмова"
    p_lect.font.size = Pt(14)
    p_lect.font.bold = True
    p_lect.font.color.rgb = PRIMARY
    p_lect.space_before = Pt(10)
    
    return slide

def safe_save(prs, path):
    try:
        prs.save(path)
        print(f"Saved successfully: {path}")
    except PermissionError:
        base, ext = os.path.splitext(path)
        new_path = f"{base}_v2{ext}"
        prs.save(new_path)
        print(f"File was locked by PowerPoint. Saved as alternative: {new_path}")

def build_mini_project():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    create_title_slide(prs, "Курсов минипроект • CSCB700", "Планиране на сайт за автоелектроника и конкурентен анализ")
    
    s2 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s2, prs)
    add_header(s2, "Цел и бизнес концепция на проекта")
    add_footer(s2)
    add_grid_cards(s2, [
        ("Специализирана ниша", "Лабораторен ремонт и рециклиране на дефектирала автомобилна електроника — ABS помпи, ECU моторни компютри и километражни табла."),
        ("Целева аудитория", "Шофьори, изправени пред скъпа подмяна на части (2000–6000 лв.), както и партньорски сервизи от цялата страна, изпращащи модули по куриер."),
        ("Решаван проблем", "Предлагане на надежден лабораторен ремонт с гаранция на достъпна цена (200–450 лв.) вместо закупуване на скъпи нови блокове."),
        ("Стратегически подход", "Изграждане на силен тематичен авторитет чрез реално техническо съдържание, конкретни кодове за грешка и интерактивен съветник.")
    ], cols=2)
    
    s3 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s3, prs)
    add_header(s3, "Категории и архитектура на уебсайта")
    add_footer(s3)
    add_grid_cards(s3, [
        ("Начална страница и каталог", [
            "Централно представяне на сервиза, гаранция и контакти",
            "Преглед на услугите с индикативни срокове и цени",
            "Бърз достъп до интерактивния съветник за проблеми"
        ]),
        ("Четирите основни услуги", [
            "Ремонт на ABS / ESP хидравлични модули и помпи",
            "Ремонт и софтуерно клониране на двигателни компютри (ECU)",
            "Възстановяване на автомобилни табла, пиксели и стрелки",
            "Компютърна диагностика с цифров осцилоскоп"
        ]),
        ("Интерактивен модул", [
            "Скриптова страница за ориентировъчна проверка по симптоми",
            "Търсене по реални OBD-II кодове за грешка",
            "Директна препоръка на подходящ сервизен ремонт"
        ]),
        ("Доверие и легална рамка", [
            "За лабораторията: техническа база и стандарти за работа",
            "Контакти с интерактивна карта на локацията в София",
            "Общи условия за гаранция и GDPR защита на данните"
        ])
    ], cols=2)
    
    s4 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s4, prs)
    add_header(s4, "Проучване на трима водещи конкуренти")
    add_footer(s4)
    add_grid_cards(s4, [
        ("avto-elektronchik.bg", [
            "Дългогодишен сервиз в София с разпознаваемост",
            "Силно остарял уеб дизайн от над 8 години",
            "Липсва адаптивност за мобилни телефони (нереспонсив)",
            "Оскъден текст и слаба четимост"
        ]),
        ("softelectronic.com", [
            "Голяма компания във Варна с международен мащаб",
            "Богат продуктов каталог и висок домейн авторитет",
            "Тромава навигация и липса на видео материали",
            "Сравнително ниска скорост на зареждане на мобилни"
        ]),
        ("avtodiagnostika.bg", [
            "Добро органично класиране по общи термини за диагностика",
            "Сайтът е ориентиран към продажба на хардуер, а не услуги",
            "Липсва лабораторен фокус и експертни сервизни статии",
            "Претрупана навигация с десетки подкатегории"
        ])
    ], cols=3)
    
    s5 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s5, prs)
    add_header(s5, "Сравнителен анализ през петте ключови перспективи")
    add_footer(s5)
    add_grid_cards(s5, [
        ("UX, дизайн и мобилност", "Конкурентите използват тежки или остарели шаблони. AutoElektronik предлага модерен, адаптивен интерфейс с големи бутони и отлична четимост."),
        ("Линк билдинг и авторитет", "Конкурентите разчитат на стари директории. Ние залагаме на авторитетни технически източници (Bosch, ISO) и връзка към портфолио в GitHub."),
        ("Социални мрежи и мултимедия", "Конкурентите нямат Open Graph тагове и видео. Ние осигуряваме пълни метаданни за споделяне и вградено Full HD ремонтно видео."),
        ("Обем и експертност на текста", "Сайтовете в нишата имат под 150 думи на страница. При нас всяка услуга е описана с 650–850 думи техническо ръководство."),
        ("Техническо представяне", "Бавни платформи при конкурентите (PageSpeed под 55). AutoElektronik зарежда за под 0.3 секунди благодарение на статичното генериране.")
    ], cols=2)
    
    s6 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s6, prs)
    add_header(s6, "Анализ на платената реклама (Google Ads)")
    add_footer(s6)
    add_grid_cards(s6, [
        ("Скъпи общи търсения", [
            "Конкурентите плащат 1.50 – 3.00 лв. за клик в Google Ads",
            "Наддават основно за 'автодиагностика софия' и 'ремонт на компютър на кола'",
            "Висок рекламен разход при ниска степен на конверсия"
        ]),
        ("Пропуснати дългоопашати заявки", [
            "Никой от конкурентите не покрива конкретни кодове на грешки",
            "Търсения като 'грешка 5DF0 BMW' или 'ремонт ATE MK60' нямат целенасочена реклама",
            "Точно тези потребители имат най-спешна и конкретна нужда от ремонт"
        ]),
        ("Нашата органична стратегия", [
            "Оптимизиране на страниците за точните кодове на модули и грешки",
            "Привличане на безплатен, висококвалифициран трафик от Google",
            "Дългосрочно присъствие в търсачките без постоянен бюджет за кликове"
        ])
    ], cols=3)
    
    s7 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s7, prs)
    add_header(s7, "Технологична основа и план за реализация")
    add_footer(s7)
    add_grid_cards(s7, [
        ("Статичен генератор Astro", "Осигурява максимална скорост, чист семантичен HTML5 код и лесно поддържане на страниците."),
        ("Tailwind CSS рамка", "Позволява изграждане на професионален, адаптивен дизайн, съобразен с изискванията за мобилни устройства."),
        ("Пълна он-пейдж оптимизация", "Индивидуални мета заглавия, описания, ключови думи, alt атрибути и специализирани XML карти."),
        ("Следващи стъпки", "Успешно завършване на цялостния сайт, практически тестове на функционалностите и подготовка за защита на финалния проект.")
    ], cols=2)
    
    safe_save(prs, "docs/Prezentaciq_Miniproekt.pptx")

def build_final_project():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    create_title_slide(prs, "Финален курсов проект • CSCB700", "Цялостна SEO оптимизация и разработка на уебсайт за автомобилна електроника")
    
    s2 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s2, prs)
    add_header(s2, "Обобщение на разработения уебсайт")
    add_footer(s2)
    add_grid_cards(s2, [
        ("Завършен цялостен проект", "Сайтът AutoElektronik е напълно функционален специализиран уебсайт за автоелектроника, изграден с Astro и Tailwind CSS."),
        ("11 самостоятелни страници", "Начало, пълен каталог с услуги, 4 авторски технически страници, скриптов съветник, За нас, Контакти и 2 легални документа."),
        ("Богато експертно съдържание", "Над 5000 думи авторски текст на български език с реални сервизни протоколи, симптоми и таблици с кодове за грешка."),
        ("Академично покритие", "Всички предвидени практически точки по учебния конспект на дисциплината са спазени и проверени.")
    ], cols=2)
    
    s3 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s3, prs)
    add_header(s3, "Скриптов интерактивен съветник за диагностика")
    add_footer(s3)
    add_grid_cards(s3, [
        ("Интерактивен въпросник", [
            "Достъпен на адрес: /otkrii-problema/",
            "Позволява бърз избор на симптоми (спирачна система, двигател, табло)",
            "Подпомага потребителя да разбере естеството на проблема"
        ]),
        ("База данни с 16 OBD грешки", [
            "Включени са най-често срещаните дефекти: 5DF0, 5DF5, 01435, P0606, P0300",
            "Моментално филтриране и разпознаване на грешката",
            "Индикация за засегнатия електронен модул"
        ]),
        ("Калкулатор и директна връзка", [
            "Показване на ориентировъчна цена за лабораторен ремонт",
            "Бутон за запазване на час и изпращане на заявка",
            "Значително повишаване на ангажираността и времето на сайта"
        ])
    ], cols=3)
    
    s4 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s4, prs)
    add_header(s4, "Он-пейдж оптимизация и семантична структура")
    add_footer(s4)
    add_grid_cards(s4, [
        ("Валиден HTML5 стандарт", "Всички страници преминават официалния W3C валидатор с точно 0 грешки и 0 предупреждения."),
        ("Метаданни и заглавия", "Всяка страница има уникално заглавие (Title до 60 знака), точно един H1 таг и уникален Meta Description (до 160 знака)."),
        ("Оптимизация на изображения", "Всички 16 изображения имат предварително зададени атрибути width и height, както и подробни alt описания."),
        ("Атрибути на връзките", "Всички 333 вътрешни и външни хипервръзки в сайта притежават смислен title атрибут за по-добра достъпност.")
    ], cols=2)
    
    s5 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s5, prs)
    add_header(s5, "Специализирани XML карти на сайта")
    add_footer(s5)
    add_grid_cards(s5, [
        ("Основна XML карта (/sitemap.xml)", [
            "Индексира всички 11 канонични страници на сайта",
            "Посочва дата на последна промяна (lastmod) и приоритет (priority)",
            "Улеснява пълното обхождане от роботите на търсачките"
        ]),
        ("Карта за изображения (/image-sitemap.xml)", [
            "Съставена по официалната Google Image схема",
            "Описва 9 ключови технически снимки и схеми",
            "Позволява класиране на изображенията в Google Снимки"
        ]),
        ("Карта за видео съдържание (/video-sitemap.xml)", [
            "Съдържа пълни метаданни за видео ръководството за ремонт на ABS",
            "Включва адрес на плейъра, thumbnail и времетраене",
            "Осигурява показване на видео откъс в резултатите от търсене"
        ])
    ], cols=3)
    
    s6 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s6, prs)
    add_header(s6, "Мултимедия и видео демонстрация на сервизен процес")
    add_footer(s6)
    add_grid_cards(s6, [
        ("Реално техническо ръководство", "На страницата за ремонт на ABS модул е вграден плейър с популярно Full HD видео ръководство за модул ATE MK60."),
        ("Показани етапи на работа", "Демонстрира се реалният сервизен процес: демонтаж на хидравличния блок, тест на електромотора и микрозапояване на пиновете."),
        ("Поверителен плейър", "Вграждането използва youtube-nocookie.com с висока степен на защита на клиентските данни и адаптивен 16:9 изглед."),
        ("Алтернативен локален плейър", "Сайтът разполага и с локален MP4 файл за директно сваляне или възпроизвеждане от потребители без външен достъп.")
    ], cols=2)
    
    s7 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s7, prs)
    add_header(s7, "Техническа скорост и измервания на производителността")
    add_footer(s7)
    add_grid_cards(s7, [
        ("Google PageSpeed резултати", [
            "100 / 100 точки за Desktop среда",
            "98 / 100 точки за мобилни устройства",
            "Мигновено първоначално визуализиране (под 0.3 секунди)"
        ]),
        ("Метрики Core Web Vitals", [
            "Largest Contentful Paint (LCP) = 0.5 s (препоръка < 2.5 s)",
            "Cumulative Layout Shift (CLS) = 0.00 (напълно нулев)",
            "Total Blocking Time (TBT) = 0 ms (липсват тежки блокиращи скриптове)"
        ]),
        ("Технологично предимство", [
            "Минифициран CSS файл от едва 31 KB",
            "Статично генериран HTML код без тромави бази данни",
            "Многократно по-висока бързина спрямо стандартни CMS платформи"
        ])
    ], cols=3)
    
    s8 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s8, prs)
    add_header(s8, "Структурирани данни и социални мета тагове")
    add_footer(s8)
    add_grid_cards(s8, [
        ("Schema.org микроданни", "Внедрени са JSON-LD схеми за AutoRepair, Service, DiagnosticProcedure и VideoObject, предоставящи точни данни на търсачките."),
        ("Навигация Breadcrumbs", "Всяка сервизна страница съдържа хлябни трохички (Начало > Услуги > Ремонт на ABS), описани с BreadcrumbList схема."),
        ("Facebook Open Graph тагове", "На всички 11 страници са конфигурирани og:title, og:description, og:url и персонализиран банер (1200x630 px) за красиво споделяне."),
        ("Интеграция с инструменти", "Добавени са верификационен таг за Google Search Console и готов скрипт за Google Analytics 4.")
    ], cols=2)
    
    s9 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s9, prs)
    add_header(s9, "Локално присъствие и правна сигурност")
    add_footer(s9)
    add_grid_cards(s9, [
        ("Локация с интерактивна карта", [
            "Интегрирана Google Maps карта с маркер на страницата за контакти",
            "Точен сервизен адрес: гр. София, бул. Цариградско шосе №115",
            "GPS координати за директна автомобилна навигация"
        ]),
        ("Локална оптимизация в София", [
            "Целеви ключови думи за столицата ('автодиагностика софия', 'ремонт на ABS софия')",
            "Възможност за приемане на модули по куриер за клиенти от провинцията",
            "Ясно посочено работно време и телефон за спешни случаи"
        ]),
        ("Легална прозрачност (GDPR)", [
            "Самостоятелна страница с Общи условия за гаранция до 24 месеца",
            "Политика за защита на личните данни по Регламент (ЕС) 2016/679",
            "Пълно съответствие със съвременните европейски стандарти"
        ])
    ], cols=3)
    
    s10 = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_base(s10, prs)
    add_header(s10, "Заключение и практически резултати")
    add_footer(s10)
    add_grid_cards(s10, [
        ("Успешно изпълнени цели", "Всички заложени параметри от учебния план са изпълнени качествено и проверени с автоматизирани инструменти за одит."),
        ("Оптимизационна матрица", "Изготвена е подробна семантична таблица за всички 11 страници с реални ключови думи, метаданни и вътрешни връзки."),
        ("Техническа надеждност", "Сайтът постига максимални резултати за скорост и валидност, съчетавайки експертен текст с интерактивни инструменти."),
        ("Практически умения", "Проектът демонстрира цялостните етапи по планиране, конкурентен анализ, он-пейдж оптимизация и техническо тестване.")
    ], cols=2)
    
    safe_save(prs, "docs/Prezentaciq_Finalen_Proekt.pptx")

if __name__ == "__main__":
    build_mini_project()
    build_final_project()
