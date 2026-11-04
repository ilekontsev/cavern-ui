import { Component } from '@angular/core';

import { Button, Icon, Page, Tooltip } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';

@Component({
	imports: [Button, DocsExample, Icon, Page, Tooltip],
	selector: 'app-docs-tooltip',
	templateUrl: './tooltip.html',
})
export class DocsTooltip {
	protected readonly code = {
		button: `<button
	app-button
	variant="secondary"
	type="button"
	app-tooltip="Создать новый канал"
>
	Наведите на меня
</button>`,

		icon: `<button
	app-button
	variant="neutral"
	size="extra-small"
	type="button"
	aria-label="Удалить"
	app-tooltip="Удалить"
>
	<span app-icon="delete"></span>
</button>`,

		hidden: `<button app-button variant="secondary" type="button" [app-tooltip]="null">
	Подсказки нет
</button>`,
	};
}
