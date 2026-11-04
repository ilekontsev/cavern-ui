import { Component, signal } from '@angular/core';
import { Button, Input, Loader, Page } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';

@Component({
	imports: [Button, DocsExample, Input, Loader, Page],
	selector: 'app-docs-loader',
	templateUrl: './loader.html',
})
export class DocsLoader {
	protected readonly loading = signal(false);

	protected readonly code = {
		basic: `<span app-loader></span>`,

		sizes: `<span app-loader style="--app-loader-size: 1rem"></span>
<span app-loader style="--app-loader-size: 1.5rem"></span>
<span app-loader style="--app-loader-size: 2rem"></span>
<span app-loader style="--app-loader-size: 3rem"></span>`,

		colors: `<span
	app-loader
	style="--app-loader-size: 2rem; --app-loader-color: #2f6fed"
></span>

<span
	app-loader
	style="--app-loader-size: 2rem; --app-loader-color: #d9480f; --app-loader-thickness: 4px"
></span>`,

		button: `<button
	app-button
	[loading]="loading()"
	type="button"
	(click)="loading.set(true)"
>
	Сохранить
</button>`,

		field: `<app-input label="Поиск" loading />
<app-input label="Поиск" loading loadingPosition="start" />`,
	};
}
