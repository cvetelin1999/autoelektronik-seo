import os
import shutil
import zipfile

def create_package():
    zip_filename = 'AutoElektronik_CSCB700_Final_Package.zip'
    temp_dir = 'temp_submission_package'
    
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    os.makedirs(os.path.join(temp_dir, 'Dokumentaciq'), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, 'Prezentacii'), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, 'Uebsait_HTML'), exist_ok=True)
    
    # Copy Docs & Screenshots
    for item in os.listdir('docs'):
        s = os.path.join('docs', item)
        d = os.path.join(temp_dir, 'Dokumentaciq', item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        elif item.endswith('.md'):
            shutil.copy2(s, d)
        elif item.endswith('.pptx'):
            shutil.copy2(s, os.path.join(temp_dir, 'Prezentacii', item))
            
    # Copy Website HTML (dist)
    for item in os.listdir('dist'):
        s = os.path.join('dist', item)
        d = os.path.join(temp_dir, 'Uebsait_HTML', item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)
            
    # Write Info file
    info_content = """КУРСОВ ПРОЕКТ ПО CSCB700 - ОПТИМИЗАЦИЯ ЗА ТЪРСАЧКИ В УЕБ
Тема: AutoElektronik - Специализиран сервиз за автомобилна електроника
Преподавател: Елисавета Тричкова-Кашъмова

1. Линк към сайта на живо в интернет:
https://autoelektronik-seo.tsvetelin-takiev.workers.dev/

2. Линк към изходния код в GitHub:
https://github.com/cvetelin1999/autoelektronik-seo

3. Основни покрити изисквания:
- 11 страници, напълно валидиран W3C HTML5 код (0 грешки, 0 предупреждения)
- 3 специализирани XML карти на сайта (/sitemap.xml, /image-sitemap.xml, /video-sitemap.xml)
- Верифициран имот в Google Search Console (Ownership Verified)
- Скриптова интерактивна страница за диагностика (/otkrii-problema/)
- Вградено техническо видео ръководство за ремонт на ABS модул ATE MK60
- Скорост на зареждане: 100/100 в Google PageSpeed Insights
"""
    with open(os.path.join(temp_dir, 'Informaciq_za_proekta.txt'), 'w', encoding='utf-8') as f:
        f.write(info_content)
        
    # Create ZIP
    shutil.make_archive('AutoElektronik_CSCB700_Final_Package', 'zip', temp_dir)
    shutil.rmtree(temp_dir)
    
    size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(f"ZIP package created: {zip_filename} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    create_package()
