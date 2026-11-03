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

let nextInputId = 0;

/**
 * Текстовое поле ui-kit с плавающей подписью, описанием и ошибками.
 *
 * Работает с сигнальными формами: `[formField]="form.login"`.
 * Слоты `[appInputPrefix]` и `[appInputSuffix]` зарезервированы под картинки,
 * лоадеры и кнопки внутри поля.
 */
@Component({
	selector: 'app-input',
	styleUrl: './input.scss',
	templateUrl: './input.html',
})
export class Input implements FormValueControl<string> {
	readonly label = input.required<string>();
	readonly inputId = input<string>();
	readonly type = input<string>('text');
	readonly autocomplete = input<string>();
	readonly description = input<string>();

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
