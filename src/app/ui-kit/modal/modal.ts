import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

let nextModalId = 0;

/**
 * Модальное окно ui-kit на нативном `<dialog>`.
 *
 * Открывается и закрывается двусторонней привязкой `[(open)]`. Закрытие по
 * Escape и клику по подложке синхронизирует `open` с состоянием окна.
 * Контент проецируется внутрь тела окна, заголовок задаётся инпутом `title`.
 */
@Component({
	selector: 'app-modal',
	imports: [Button, Icon],
	styleUrl: './modal.scss',
	templateUrl: './modal.html',
})
export class Modal {
	readonly open = model(false);
	readonly title = input<string>();

	protected readonly titleId = `app-modal-title-${nextModalId++}`;
	private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

	constructor() {
		effect(() => {
			const dialog = this.dialog()?.nativeElement;

			if (!dialog) {
				return;
			}

			if (this.open() && !dialog.open) {
				dialog.showModal();
			} else if (!this.open() && dialog.open) {
				dialog.close();
			}
		});
	}

	protected close(): void {
		this.open.set(false);
	}

	protected onBackdropClick(event: PointerEvent): void {
		if (event.target === event.currentTarget) {
			this.close();
		}
	}

	protected onNativeClose(): void {
		if (this.open()) {
			this.open.set(false);
		}
	}
}
