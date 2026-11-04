import {
	Component,
	ComponentRef,
	EnvironmentInjector,
	inject,
	Injector,
	input,
	output,
	signal,
	Type,
	viewChild,
	ViewContainerRef,
} from '@angular/core';

import { Modal } from './modal';

/**
 * Внутренняя оболочка `ModalService`: связывает окно ui-kit с динамическим
 * компонентом контента.
 */
@Component({
	selector: 'app-modal-host',
	imports: [Modal],
	styleUrl: './modal-host.scss',
	templateUrl: './modal-host.html',
})
export class ModalHost {
	private readonly environmentInjector = inject(EnvironmentInjector);

	public readonly title = input<string>();
	public readonly closed = output<void>();

	protected readonly isOpen = signal(true);

	private readonly content = viewChild.required('content', {
		read: ViewContainerRef,
	});

	public attach<C>(component: Type<C>, injector: Injector): ComponentRef<C> {
		const componentRef = this.content().createComponent(component, {
			environmentInjector: this.environmentInjector,
			injector,
		});

		componentRef.changeDetectorRef.detectChanges();

		return componentRef;
	}

	protected onOpenChange(open: boolean): void {
		this.isOpen.set(open);

		if (!open) {
			this.closed.emit();
		}
	}
}
