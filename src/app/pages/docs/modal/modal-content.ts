import { Component, inject } from '@angular/core';

import { Button, MODAL_CLOSE, MODAL_DATA, MODAL_REF } from '../../../ui-kit';

export interface DemoModalData {
	message: string;
}

@Component({
	selector: 'app-docs-modal-content',
	imports: [Button],
	styleUrl: './modal-content.scss',
	templateUrl: './modal-content.html',
})
export class DocsModalContent {
	protected readonly data = inject(MODAL_DATA) as DemoModalData;
	protected readonly modalRef = inject(MODAL_REF);
	protected readonly close = inject(MODAL_CLOSE);
}
