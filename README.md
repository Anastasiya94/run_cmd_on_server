# run_cmd_on_server
Данная утилита позволяет выполнять команды в терминале сервера из веб интерфейса.

Подготовка сервера (подразумевается наличие node.js и npm):
```cmd
npm install body-parser
npm install encoding
npm install express
npm install htmlspecialchars
npm install pg-promise
npm install striptags
npm install unescape
```

Программа имеет возможность хранить историю всех ранее выполненых команд в БД PostgreSQL. Если вы хотите хранить историю и у вас на сервере установлена СУБД PostrgeSQL, вам необходимо создать две таблицы используя следующие скрипты:
```sql
CREATE TABLE public.statuses (
  id      smallint NOT NULL,
  "name"  varchar(30) NOT NULL,
  /* Keys */
  CONSTRAINT statuses_pkey
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
);
INSERT INTO public.statuses(id,name) VALUES (1,"Завершено");
INSERT INTO public.statuses(id,name) VALUES (2,"В процессе");
INSERT INTO public.statuses(id,name) VALUES (3,"Ошибка");

CREATE TABLE public."template" (
  id          serial NOT NULL,
  command     varchar(20) NOT NULL,
  id_status   smallint NOT NULL,
  result      text NOT NULL,
  "comment"   text,
  parameter   varchar(38),
  time_start  timestamp WITHOUT TIME ZONE NOT NULL,
  time_end    timestamp WITHOUT TIME ZONE NOT NULL,
  /* Keys */
  CONSTRAINT template_pkey
    PRIMARY KEY (id),
  /* Foreign keys */
  CONSTRAINT "Foreign_key01"
    FOREIGN KEY (id_status)
    REFERENCES public.statuses(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) WITH (
    OIDS = FALSE
);
```
Конфигурация серверной части выполняется с помощью файла config.js
Изменяемые поля файла представлены ниже:
```javascript
config.database.host = '127.0.0.1'; //адрес базы данных
config.database.port = 9994; //порт базы данных
config.database.database = 'commands'; //имя базы данных
config.database.user = 'postgres'; //имя пользователя для подключения к БД
config.database.password = '1111'; //пароль для подключения к БД

config.server.port = 3000; //порт для самого сервера
```
Если в полях базы данных указаны неверные данные и серверу не удастся создать подключение, то загрузка, равно как и запись истории, производиться не будет, и все данные отображаемые в окне просмотра результатов будут храниться до перезапуска сервера.

Запуск сервера производится командой ```node service.js``` из корневой директории проекта.

После запуска сервера, для загрузки приложения необходимо войти в браузер и ввести в адресной строке ```localhost:port```, где порт - это 4 цифры указанные в файле конфигурации (```config.server.port```). По умолчанию ```localhost:3000```.

