import { Component } from '@angular/core';

/**
 * Индикатор загрузки ui-kit.
 *
 * Атрибутный компонент, поэтому вешается на любой пустой тег:
 * `<span app-loader></span>`
 *
 * Размер и цвет меняются CSS-переменными:
 * `--app-loader-size` (по умолчанию `1.25em`) и `--app-loader-color`
 * (по умолчанию `currentColor`).
 */
@Component({
	// Лоадер намеренно применяется к любому тегу, поэтому селектор атрибутный.
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: '[app-loader]',
	styleUrl: './loader.scss',
	template: '',
	host: {
		class: 'app-loader',
		role: 'status',
		'aria-label': 'Загрузка',
	},
})
export class Loader {}
