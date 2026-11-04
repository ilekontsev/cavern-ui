import { Directive, input } from '@angular/core';

/**
 * Иконка ui-kit на шрифте Material Symbols Rounded.
 *
 * Атрибутная директива, поэтому вешается на любой пустой тег и принимает только
 * название иконки, например `home` или `arrow_forward`:
 * `<span app-icon="home"></span>`
 *
 * Размер и цвет меняются CSS-переменными:
 * `--app-icon-size` (по умолчанию `1.25em`) и `--app-icon-color`
 * (по умолчанию `currentColor`).
 */
@Directive({
	// Иконка намеренно применяется к любому тегу, поэтому селектор атрибутный.
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[app-icon]',
	host: {
		'[attr.aria-hidden]': 'true',
		'[textContent]': 'appIcon()',
		'[style]': 'styles',
	},
})
export class Icon {
	readonly appIcon = input.required<string>({ alias: 'app-icon' });

	protected readonly styles: Record<string, string> = {
		display: 'inline-block',
		'vertical-align': 'middle',
		color: 'var(--app-icon-color, currentColor)',
		'font-family': "'Material Symbols Rounded', sans-serif",
		'font-size': 'var(--app-icon-size, 1.25em)',
		'font-style': 'normal',
		'font-weight': 'normal',
		'line-height': '1',
		'letter-spacing': 'normal',
		'text-transform': 'none',
		'white-space': 'nowrap',
		'word-wrap': 'normal',
		direction: 'ltr',
		'font-feature-settings': "'liga'",
		'-webkit-font-smoothing': 'antialiased',
	};
}
