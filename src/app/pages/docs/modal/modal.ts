import { Component, inject, Injector, signal } from '@angular/core';

import { Button, Modal, ModalService, Page } from '../../../ui-kit';
import { DocsExample } from '../docs-example/docs-example';
import { type DemoModalData, DocsModalContent } from './modal-content';

@Component({
	imports: [Button, DocsExample, Modal, Page],
	selector: 'app-docs-modal',
	styleUrl: './modal.scss',
	templateUrl: './modal.html',
})
export class DocsModal {
	private readonly modalService = inject(ModalService);
	private readonly injector = inject(Injector);

	protected readonly isOpen = signal(false);
	protected readonly result = signal<string | null>(null);

	protected openFromService(): void {
		const modalRef = this.modalService.open<string, DemoModalData>(DocsModalContent, {
			title: 'Окно из ModalService',
			data: { message: 'Компонент создан динамически и получил данные через MODAL_DATA.' },
			injector: this.injector,
		});

		void modalRef.afterClosed.then((result) => this.result.set(result ?? null));
	}

	protected readonly code = {
		declarative: `<button app-button type="button" (click)="isOpen.set(true)">Открыть окно</button>

<app-modal [(open)]="isOpen" title="Простое модальное окно">
	<p>Контент модального окна</p>
	<button app-button type="button" (click)="isOpen.set(false)">Понятно</button>
</app-modal>`,

		service: `const modalRef = this.modalService.open<string, DemoModalData>(DocsModalContent, {
	title: 'Окно из ModalService',
	data: { message: 'Привет' },
	injector: this.injector,
});

modalRef.afterClosed.then((result) => this.result.set(result ?? null));`,

		content: `export class DocsModalContent {
	protected readonly data = inject(MODAL_DATA) as DemoModalData;
	protected readonly modalRef = inject(MODAL_REF);
	protected readonly close = inject(MODAL_CLOSE);
}`,
	};
}
