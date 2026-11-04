import {
	Component,
	ElementRef,
	booleanAttribute,
	computed,
	input,
	model,
	output,
	viewChild,
} from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { Icon } from '../icon/icon';

let nextInputId = 0;

/** Одна иконка или несколько иконок Material Symbols. */
export type InputIcon = string | readonly string[];

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
 */
@Component({
	selector: 'app-input',
	imports: [Icon],
	styleUrl: './input.scss',
	templateUrl: './input.html',
})
export class Input implements FormValueControl<string> {
	readonly label = input.required<string>();
	readonly inputId = input<string>();
	readonly type = input<string>('text');
	readonly autocomplete = input<string>();
	readonly description = input<string>();

	/** Иконки Material Symbols внутри поля в начале. */
	readonly iconStart = input<InputIcon>();
	/** Иконки Material Symbols внутри поля в конце. */
	readonly iconEnd = input<InputIcon>();

	readonly value = model<string>('');
	readonly name = input<string>('');
	readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
	readonly disabled = input(false, { transform: booleanAttribute });
	readonly readonly = input(false, { transform: booleanAttribute });
	readonly required = input(false, { transform: booleanAttribute });
	readonly invalid = input(false);
	readonly touched = input(false);
	readonly touch = output<void>();

	private readonly generatedId = `app-input-${nextInputId++}`;
	private readonly controlElement = viewChild<ElementRef<HTMLInputElement>>('control');

	protected readonly controlId = computed(() => this.inputId() ?? this.generatedId);
	protected readonly messageId = computed(() => `${this.controlId()}-message`);
	protected readonly startIcons = computed(() => toIconNames(this.iconStart()));
	protected readonly endIcons = computed(() => toIconNames(this.iconEnd()));
	protected readonly showErrors = computed(
		() => this.invalid() && this.touched() && this.errors().length > 0
	);
	protected readonly describedBy = computed(() =>
		this.showErrors() || this.description() ? this.messageId() : null
	);

	focus(options?: FocusOptions): void {
		this.controlElement()?.nativeElement.focus(options);
	}

	protected onInput(event: Event): void {
		this.value.set((event.target as HTMLInputElement).value);
	}

	protected onBlur(): void {
		this.touch.emit();
	}
}
