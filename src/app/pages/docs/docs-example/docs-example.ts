import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Блок документации: заголовок, живой пример и его код.
 */
@Component({
	selector: 'app-docs-example',
	styleUrl: './docs-example.scss',
	templateUrl: './docs-example.html',
})
export class DocsExample {
	readonly title = input.required<string>();
	readonly code = input<string>();
	readonly column = input(false, { transform: booleanAttribute });
}
