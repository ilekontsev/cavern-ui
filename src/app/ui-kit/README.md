# ui-kit

Базовые UI-компоненты приложения. Папка спроектирована так, чтобы её можно было
без переделок вынести в отдельную библиотеку.

## Главное правило: изоляция

**`ui-kit` не импортирует ничего извне себя.** Разрешены только:

- сам Angular (`@angular/core`, `@angular/common` и т.п.);
- файлы внутри `ui-kit/`.

Запрещено импортировать:

- код приложения: `src/app/pages/**`, `src/app/app.*`, сервисы, модели, гуарды,
  резолверы, конфиги роутинга;
- значения, миксины и классы из глобальных стилей (`src/styles.scss`), а также
  объявления CSS-переменных — компоненты должны быть визуально самодостаточными;
  читать переменные темы можно, объявлять их в `ui-kit` нельзя (см. ниже);
- сторонние библиотеки и ассеты из `public/` (если понадобится зависимость —
  сначала обсуждаем, потому что она станет зависимостью библиотеки).

Проверка простая: если при копировании папки `ui-kit` в отдельный репозиторий
что-то перестаёт собираться — правило нарушено.

## Темизация

Единственная разрешённая связь с приложением — чтение CSS-переменных темы.
Компоненты читают их **только с fallback-значением**, чтобы работать и без
приложения:

```scss
background: var(--cavern-surface, #ffffff);
color: var(--cavern-text, #1a1d23);
```

Fallback-значения — светлая схема, то есть поведение по умолчанию для страницы без
темы. Переменные перечислены ниже, объявляются они в приложении
(`src/styles.scss`), в `ui-kit` их быть не должно.

## Правила компонентов

- Все компоненты standalone, селекторы с префиксом `app-`.
- Стили — только локальные (`styleUrl`), без глобальных селекторов и `::ng-deep`.
- Компоненты не полагаются на глобальный `box-sizing` и не задают шрифт:
  типографика наследуется от страницы, это ожидаемо для библиотеки.
- Никакой бизнес-логики, роутинга и работы с API внутри `ui-kit`.
- Всё, что должно быть доступно снаружи, реэкспортируется через `index.ts` —
  это публичный API папки (в будущем `public-api.ts` библиотеки).

## Состав

| Компонент | Селектор     | Назначение                                                |
| --------- | ------------ | --------------------------------------------------------- |
| `Card`    | `app-card`   | Карточка-контейнер с необязательным заголовком            |
| `Icon`    | `app-icon`   | Иконка-директива по названию из Material Symbols Rounded  |
| `Input`   | `app-input`  | Текстовое поле с плавающей подписью, описанием и ошибками |
| `Loader`  | `app-loader` | Индикатор загрузки с настраиваемым размером и цветом      |
| `Modal`   | `app-modal`  | Модальное окно на нативном `<dialog>`                     |
| `Page`    | `app-page`   | Каркас страницы: заголовок, подзаголовок, контент         |

Сервисы:

| Сервис          | Назначение                                                          |
| --------------- | ------------------------------------------------------------------- |
| `ModalService`  | Открытие модальных окон с динамическим контентом                    |
| `PortalService` | Динамическое создание оверлеев в корне документа с учётом `z-index` |

## Иконки

`Icon` — атрибутная директива: вешается на любой пустой тег и принимает только
название иконки.

```html
<span app-icon="home"></span> <i app-icon="arrow_forward"></i>
```

Иконки рисуются лигатурами шрифта Material Symbols Rounded. Директива сама
подставляет название в элемент, поэтому внутри него не должно быть контента.
Сам шрифт подключается приложением в `src/index.html`; если `ui-kit` выносится
в отдельную библиотеку, шрифт нужно подключить на стороне приложения.

Директиву нужно добавить в `imports` компонента, где она используется:

```ts
import { Icon } from '../../ui-kit';

@Component({ imports: [Icon], /* … */ })
```

Размер и цвет иконки задаются CSS-переменными:

```html
<span app-icon="home" style="--app-icon-size: 2rem; --app-icon-color: #2f6fed"></span>
```

- `--app-icon-size` — размер, по умолчанию `1.25em` (масштабируется от
  размера текста);
- `--app-icon-color` — цвет, по умолчанию `currentColor`.

В кнопку иконка добавляется директивой прямо в контент — до или после текста:

```html
<button app-button>
	<span app-icon="add"></span>
	Создать
</button>

<button app-button variant="secondary">
	Далее
	<span app-icon="arrow_forward"></span>
</button>

<button app-button aria-label="Удалить">
	<span app-icon="delete"></span>
</button>
```

У поля иконки задаются через `iconStart` и `iconEnd` — внутри рамки в начале и в
конце. В оба можно передать массив, если иконок нужно несколько:

```html
<app-input label="Поиск" iconStart="search" iconEnd="close" />

<app-input
	label="Фильтр"
	[iconStart]="['search', 'filter_list']"
	[iconEnd]="['visibility', 'more_vert']"
/>
```

Если иконкам нужно разное оформление, используйте слоты поля: они попадают в те
же зоны, что и `iconStart`/`iconEnd`, но позволяют задать стили каждой иконке.

```html
<app-input label="Поиск">
	<span app-icon="search" appInputPrefix></span>
	<span app-icon="filter_list" appInputPrefix style="--app-icon-color: #2f6fed"></span>
</app-input>
```

Переменные можно задать и на кнопке или поле — иконки их унаследуют:

```html
<button app-button style="--app-icon-size: 1rem">
	<span app-icon="add"></span>
	Создать
</button>
```

## Лоадеры

`Loader` — атрибутный компонент с кольцевым индикатором. Вешается на любой
пустой тег:

```html
<span app-loader></span>
```

Размер, цвет и толщина кольца задаются CSS-переменными:

```html
<span
	app-loader
	style="
		--app-loader-size: 2rem;
		--app-loader-color: #2f6fed;
		--app-loader-thickness: 3px;
	"
></span>
```

- `--app-loader-size` — размер, по умолчанию `1.25em` (масштабируется от
  размера текста);
- `--app-loader-color` — цвет, по умолчанию `currentColor`;
- `--app-loader-thickness` — толщина кольца, по умолчанию `2px`.

В кнопке лоадер включается инпутом `loading`. Пока он активен, кнопка
становится disabled, скрывает текст и иконки, но сохраняет ширину:

```html
<button app-button [loading]="saving()">Сохранить</button>
```

В поле лоадер включается инпутом `loading`, а сторону задаёт
`loadingPosition` (`start` или `end`, по умолчанию `end`). Если на этой стороне
заданы иконки, лоадер заменяет их:

```html
<app-input label="Поиск" loading />
<app-input label="Поиск" loading loadingPosition="start" />

<!-- Лоадер заменит иконку search -->
<app-input label="Поиск" iconEnd="search" loading />
```

## Модальное окно

`Modal` построен на нативном `<dialog>`: браузер сам управляет фокусом, слоем
поверх страницы и закрытием по Escape. Видимость задаётся двусторонней
привязкой `open`, заголовок — инпутом `title` (необязательный).

```html
<app-modal [(open)]="isOpen" title="Подтверждение">
	<p>Удалить канал без возможности восстановления?</p>

	<div class="actions">
		<button app-button variant="secondary" type="button" (click)="isOpen.set(false)">Отмена</button>
		<button app-button type="button" (click)="remove()">Удалить</button>
	</div>
</app-modal>
```

Если заголовка нет, кнопка закрытия не выводится. Клик по подложке и Escape
закрывают окно и сбрасывают `open` в `false`.

### Сервис модальных окон

`ModalService` создаёт окно в корне документа и монтирует в него динамический
компонент. Сервис принимает инжектор компонента, из которого открывается окно,
поэтому контент получает провайдеры родителя.

```ts
const modalRef = this.modalService.open<string, { id: number }>(ModalContent, {
	title: 'Настройки',
	data: { id: 1 },
	injector: this.injector,
});

modalRef.afterClosed.then((result) => console.log(result));
```

Внутри динамического компонента доступны токены:

- `MODAL_DATA` — данные, переданные в `open()`;
- `MODAL_REF` — `ModalRef` с `id`, `data`, `close()` и `afterClosed`;
- `MODAL_CLOSE` — функция закрытия текущего окна.

```ts
export class ModalContent {
	protected readonly data = inject(MODAL_DATA) as { id: number };
	protected readonly modalRef = inject(MODAL_REF);
	protected readonly close = inject(MODAL_CLOSE);
}
```

### Порталы

`PortalService` — основа `ModalService` и будущих поповеров, дропдаунов и
тултипов. Он создаёт контейнер в `document.body`, монтирует в него компонент и
выдаёт каждому порталу следующий `z-index`.

```ts
const portal = this.portalService.create(MyOverlay, {
	injector: this.injector,
});

portal.close();
```

## Общие стили полей

Каркас текстовых полей (рамка, плавающая подпись, состояния, слоты) лежит в
`field/_field.scss`. Компонент `Input` подключает его через `@use`, а будущий
`Textarea` сможет переиспользовать те же стили без дублирования.

## Использование

```ts
import { Card, Input, Loader, Modal, Page } from '../../ui-kit';
```

Импорт всегда через `index.ts`, а не через пути к отдельным файлам.
