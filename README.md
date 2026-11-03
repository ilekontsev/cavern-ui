# Cavern

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Mock API (json-server)

Регистрация и авторизация работают через `json-server`. Запустите его в отдельном терминале:

```bash
npm run api
```

Затем в другом терминале:

```bash
npm start
```

- `db.json` — mock-база с коллекцией `users`;
- `proxy.conf.json` — dev-прокси: запросы Angular на `/api/*` уходят в
  `json-server` на `http://localhost:3000`;
- все запросы в коде идут через `API_BASE_URL = '/api'` из
  `src/app/core/api.ts`.

Когда появится реальный бэкенд, замените `target` в `proxy.conf.json` и
уберите `pathRewrite` (если бэкенд будет отдавать API сразу по `/api`).
Компоненты и формы при этом менять не нужно.

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
