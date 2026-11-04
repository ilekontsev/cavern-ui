import { booleanAttribute, Component, computed, ElementRef, inject, input } from '@angular/core';

import { Loader } from '../loader/loader';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'contrast' | 'neutral';
export type ButtonSize = 'extra-small' | 'small' | 'medium' | 'large';

/**
 * Кнопка ui-kit.
 *
 * Используется на нативном `<button>` или `<a>`:
 * `<button app-button variant="primary">…</button>`
 * `<a app-button variant="secondary" [routerLink]="routeUrls.profile">…</a>`
 *
 * Иконки добавляются директивой `app-icon` прямо в контент кнопки.
 *
 * В состоянии `loading` кнопка блокируется, скрывает свой контент и показывает
 * по центру лоадер.
 */
@Component({
	// Кнопка намеренно применяется к нативным <button> и <a>, поэтому селектор атрибутный.
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'button[app-button], a[app-button]',
	imports: [Loader],
	styleUrl: './button.scss',
	templateUrl: './button.html',
	host: {
		'[attr.data-variant]': 'variant()',
		'[attr.data-size]': 'size()',
		'[attr.data-loading]': 'loading() ? "true" : null',
		'[attr.disabled]': 'isNativeButton && isDisabled() ? "" : null',
		'[attr.aria-disabled]': 'isDisabled() ? "true" : null',
		'[attr.aria-busy]': 'loading() ? "true" : null',
		'[attr.tabindex]': '!isNativeButton && isDisabled() ? "-1" : null',
	},
})
export class Button {
	private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

	public readonly variant = input<ButtonVariant>('primary');
	public readonly size = input<ButtonSize>('medium');
	public readonly disabled = input(false, { transform: booleanAttribute });
	public readonly loading = input(false, { transform: booleanAttribute });

	protected readonly isNativeButton = this.elementRef.nativeElement.tagName === 'BUTTON';
	protected readonly isDisabled = computed(() => this.disabled() || this.loading());
}
