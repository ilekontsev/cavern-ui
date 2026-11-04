import { Component } from '@angular/core';

import { Button, Icon, Input, Page } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';

@Component({
	imports: [Button, DocsExample, Icon, Input, Page],
	selector: 'app-docs-icon',
	templateUrl: './icon.html',
})
export class DocsIcon {
	protected readonly icons = ['home', 'search', 'favorite', 'settings', 'delete', 'arrow_forward'];

	protected readonly code = {
		basic: `<span app-icon="home"></span>
<span app-icon="search"></span>
<span app-icon="favorite"></span>`,

		sizes: `<span app-icon="home" style="--app-icon-size: 1rem"></span>
<span app-icon="home" style="--app-icon-size: 1.5rem"></span>
<span app-icon="home" style="--app-icon-size: 2rem"></span>
<span app-icon="home" style="--app-icon-size: 3rem"></span>`,

		colors: `<span app-icon="favorite" style="--app-icon-color: #2f6fed"></span>
<span app-icon="favorite" style="--app-icon-color: #2f9e44"></span>
<span app-icon="favorite" style="--app-icon-color: #d9480f"></span>`,

		button: `<button app-button variant="primary" type="button">
	<span app-icon="add"></span>
	Создать
</button>`,

		field: `<app-input label="Поиск" iconStart="search" iconEnd="close" />`,
	};
}
