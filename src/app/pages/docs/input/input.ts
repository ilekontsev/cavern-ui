import { Component } from '@angular/core';
import { Icon, Input, Page } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';

@Component({
	imports: [DocsExample, Icon, Input, Page],
	selector: 'app-docs-input',
	templateUrl: './input.html',
})
export class DocsInput {
	protected readonly errors = [{ kind: 'required', message: 'Укажите значение' }];

	protected readonly code = {
		basic: `<app-input
	label="Почта"
	type="email"
	description="Мы не передаём адрес третьим лицам."
/>`,

		value: `<app-input
	label="Имя"
	value="Анна"
	autocomplete="name"
	description="Поле уже заполнено."
/>`,

		icons: `<app-input label="Поиск" iconStart="search" iconEnd="close" />

<app-input
	label="Фильтр"
	[iconStart]="['search', 'filter_list']"
	[iconEnd]="['visibility', 'more_vert']"
/>`,

		slots: `<app-input label="Поиск">
	<span app-icon="search" appInputPrefix></span>
	<span app-icon="tune" appInputSuffix></span>
</app-input>`,

		loading: `<app-input label="Загрузка в конце" loading />
<app-input label="Загрузка в начале" loading loadingPosition="start" />
<app-input label="Лоадер вместо иконки" iconEnd="search" loading />`,

		states: `<app-input label="Недоступно" disabled />
<app-input label="Только для чтения" readonly value="Cavern" />
<app-input
	label="С ошибкой"
	[invalid]="true"
	[touched]="true"
	[errors]="errors"
/>`,
	};
}
