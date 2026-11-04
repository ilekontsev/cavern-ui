import {
	booleanAttribute,
	Component,
	computed,
	ElementRef,
	input,
	model,
	output,
	viewChild,
} from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

import { Icon } from '../icon/icon';
import { Loader } from '../loader/loader';

let nextInputId = 0;

/** Одна иконка или несколько иконок Material Symbols. */
export type InputIcon = string | readonly string[];

/** Сторона поля, на которой показывается лоадер. */
export type InputLoadingPosition = 'start' | 'end';

function toIconNames(value: InputIcon | undefined): readonly string[] {
	if (!value) {
		return [];
	}

	return typeof value === 'string' ? [value] : value;
}

/**
 * Текстовое поле ui-kit с плавающей подписью, описанием и ошибками.
 *
 * Работает с сигнальными формами: `[formField]="form.login"`.
 * Иконки внутри поля задаются через `iconStart` и `iconEnd`; в них можно
 * передать как одно название, так и массив названий. Слоты
 * `[appInputPrefix]` и `[appInputSuffix]` зарезервированы под картинки,
 * лоадеры, кнопки и иконки с собственным оформлением.
 *
 * В состоянии `loading` на выбранной стороне (`loadingPosition`) показывается
 * лоадер. Если на этой стороне заданы иконки `iconStart`/`iconEnd`, лоадер
 * заменяет их.
 */
@Component({
	selector: 'app-input',
	imports: [Icon, Loader],
	styleUrl: './input.scss',
	templateUrl: './input.html',
})
export class Input implements FormValueControl<string> {
	public readonly label = input.required<string>();
	public readonly inputId = input<string>();
	public readonly type = input<string>('text');
	public readonly autocomplete = input<string>();
	public readonly description = input<string>();

	/** Иконки Material Symbols внутри поля в начале. */
	public readonly iconStart = input<InputIcon>();
	/** Иконки Material Symbols внутри поля в конце. */
	public readonly iconEnd = input<InputIcon>();

	public readonly loading = input(false, { transform: booleanAttribute });
	public readonly loadingPosition = input<InputLoadingPosition>('end');

	public readonly value = model<string>('');
	public readonly name = input<string>('');
	public readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
	public readonly disabled = input(false, { transform: booleanAttribute });
	public readonly readonly = input(false, { transform: booleanAttribute });
	public readonly required = input(false, { transform: booleanAttribute });
	public readonly invalid = input(false);
	public readonly touched = input(false);
	public readonly touch = output<void>();

	private readonly generatedId = `app-input-${nextInputId++}`;
	private readonly controlElement = viewChild<ElementRef<HTMLInputElement>>('control');

	protected readonly controlId = computed(() => this.inputId() ?? this.generatedId);
	protected readonly messageId = computed(() => `${this.controlId()}-message`);
	protected readonly startIcons = computed(() => toIconNames(this.iconStart()));
	protected readonly endIcons = computed(() => toIconNames(this.iconEnd()));
	protected readonly isLoadingStart = computed(
		() => this.loading() && this.loadingPosition() === 'start'
	);
	protected readonly isLoadingEnd = computed(
		() => this.loading() && this.loadingPosition() === 'end'
	);
	protected readonly showErrors = computed(
		() => this.invalid() && this.touched() && this.errors().length > 0
	);
	protected readonly describedBy = computed(() =>
		this.showErrors() || this.description() ? this.messageId() : null
	);

	public focus(options?: FocusOptions): void {
		this.controlElement()?.nativeElement.focus(options);
	}

	protected onInput(event: Event): void {
		this.value.set((event.target as HTMLInputElement).value);
	}

	protected onBlur(): void {
		this.touch.emit();
	}
}
