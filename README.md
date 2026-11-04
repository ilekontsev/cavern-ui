# Cavern

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Mock API

Авторизация работает через лёгкий mock-сервер на Node.js (`server/index.js`).
Запустите его в отдельном терминале:

```bash
npm run api
```

Затем в другом терминале:

```bash
npm start
```

- `db.json` — mock-база с коллекциями `users` и `channels`;
- `proxy.conf.json` — dev-прокси: запросы Angular на `/api/*` уходят в
  mock-сервер на `http://localhost:3000`;
- все запросы в коде идут через `API_BASE_URL = '/api'` из
  `src/app/core/api.ts`.

### Эндпоинты

| Метод  | Путь                 | Назначение                                                                         |
| ------ | -------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/users/me`          | данные пользователя; без сессии создаёт гостя                                      |
| POST   | `/auth/login`        | вход, выдаёт access/refresh токены в HttpOnly-cookie                               |
| POST   | `/auth/register`     | регистрация, выдаёт токены                                                         |
| POST   | `/auth/refresh`      | обновляет access-токен по refresh-cookie                                           |
| POST   | `/auth/logout`       | удаляет cookie, при следующем `/users/me` создаётся гость                          |
| GET    | `/channels`          | список каналов; `?search=` ищет по названию и описанию, `?mine=true` — только свои |
| POST   | `/channels`          | создаёт канал; доступно только авторизованным пользователям                        |
| GET    | `/channels/:id`      | данные одного канала                                                               |
| POST   | `/channels/:id/join` | добавляет текущего пользователя (включая гостя) в канал                            |
| DELETE | `/channels/:id`      | удаляет канал; доступно только его владельцу                                       |

Токены подписаны HMAC-SHA256 и хранятся только в HttpOnly-cookie, поэтому из JS
их прочитать нельзя. Время жизни по умолчанию: access — 15 минут, refresh —
7 дней. Для проверки рефреша можно запустить сервер с коротким access-токеном:

```bash
ACCESS_TOKEN_TTL=60 npm run api
```

Секрет подписи задаётся через `AUTH_SECRET` (по умолчанию — значение для
локальной разработки).

На клиенте `provideAppInitializer` вызывает `GET /users/me` до первого рендера.
Если пользователь не авторизован, сервер создаёт гостя с уникальным id. На 401
интерцептор `authInterceptor` обновляет токен и повторяет запрос, а если refresh
недействителен — сбрасывает сессию до гостевой.

> Пароли в `db.json` хранятся в открытом виде — это только mock для локальной
> разработки. На реальном бэкенде пароль должен хешироваться на сервере, а роль,
> тип и дату регистрации тоже должен назначать сервер.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
