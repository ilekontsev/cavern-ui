import { Component, ElementRef, booleanAttribute, inject, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'contrast' | 'neutral';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Кнопка ui-kit.
 *
 * Используется на нативном `<button>` или `<a>`:
 * `<button app-button variant="primary">…</button>`
 * `<a app-button variant="secondary" routerLink="/profile">…</a>`
 */
@Component({
	// Кнопка намеренно применяется к нативным <button> и <a>, поэтому селектор атрибутный.
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'button[app-button], a[app-button]',
	styleUrl: './button.scss',
	templateUrl: './button.html',
	host: {
		'[attr.data-variant]': 'variant()',
		'[attr.data-size]': 'size()',
		'[attr.disabled]': 'isNativeButton && disabled() ? "" : null',
		'[attr.aria-disabled]': 'disabled() ? "true" : null',
		'[attr.tabindex]': '!isNativeButton && disabled() ? "-1" : null',
	},
})
export class Button {
	readonly variant = input<ButtonVariant>('primary');
	readonly size = input<ButtonSize>('medium');
	readonly disabled = input(false, { transform: booleanAttribute });

	protected readonly isNativeButton =
		inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
}
