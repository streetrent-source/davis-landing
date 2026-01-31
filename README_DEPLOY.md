# Deploy (FTP) — REG.RU ISPmanager


## Как это работает
После `git push` в `main` запускается GitHub Actions workflow "Deploy to hosting (FTP)" и загружает файлы сайта по FTP в папку сайта на хостинге.


## Где добавить секреты
GitHub → repo → Settings → Secrets and variables → Actions → New repository secret


Добавить 5 секретов:


- FTP_HOST = 37.140.192.199
- FTP_PORT = 21
- FTP_USER = u3372682
- FTP_PASS = (пароль FTP-пользователя в ISPmanager)
- FTP_PATH = /www/davis.ru


## Где взять пароль (FTP_PASS)
ISPmanager → FTP-пользователи → выбрать пользователя u3372682 → Изменить пароль (задай новый и сохрани).


## Проверка
Сделай любой коммит и push в main → вкладка Actions → job должен быть зелёным.
Если job красный — открой лог и скопируй последние 30–50 строк ошибки (без секретов).
