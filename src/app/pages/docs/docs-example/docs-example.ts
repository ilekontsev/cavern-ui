import { booleanAttribute, Component, input } from '@angular/core';

/**
 * Блок документации: заголовок, живой пример и его код.
 */
@Component({
	selector: 'app-docs-example',
	styleUrl: './docs-example.scss',
	templateUrl: './docs-example.html',
})
export class DocsExample {
	public readonly title = input.required<string>();
	public readonly code = input<string>();
	public readonly column = input(false, { transform: booleanAttribute });
}
