import { Component, signal } from '@angular/core';

import { Button, Icon, Page } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';

@Component({
	imports: [Button, DocsExample, Icon, Page],
	selector: 'app-docs-button',
	templateUrl: './button.html',
})
export class DocsButton {
	protected readonly loading = signal(false);

	protected readonly code = {
		variants: `<button app-button variant="primary" type="button">Primary</button>
<button app-button variant="secondary" type="button">Secondary</button>
<button app-button variant="tertiary" type="button">Tertiary</button>
<button app-button variant="contrast" type="button">Contrast</button>
<button app-button variant="neutral" type="button">Neutral</button>`,

		sizes: `<button app-button size="extra-small" type="button">Extra small</button>
<button app-button size="small" type="button">Small</button>
<button app-button size="medium" type="button">Medium</button>
<button app-button size="large" type="button">Large</button>`,

		icons: `<button app-button type="button">
	<span app-icon="add"></span>
	Создать
</button>

<button app-button variant="secondary" type="button">
	Далее
	<span app-icon="arrow_forward"></span>
</button>

<button app-button variant="neutral" type="button" aria-label="Удалить">
	<span app-icon="delete"></span>
</button>`,

		loading: `<button app-button [loading]="saving()" type="button">
	<span app-icon="save"></span>
	Сохранить
</button>

<button app-button loading type="button">Всегда загружается</button>
<button app-button disabled type="button">Недоступно</button>`,
	};
}
