import { EnvironmentInjector, inject, Injectable, Injector, Type } from '@angular/core';

import { PortalService } from '../portal/portal.service';
import { MODAL_CLOSE, MODAL_DATA, MODAL_REF } from './modal.tokens';
import { ModalHost } from './modal-host';
import { ModalRef } from './modal-ref';

/** Настройки открытия модального окна. */
export interface ModalConfig<TData = unknown> {
	/** Заголовок окна. Если не задан, кнопка закрытия не выводится. */
	title?: string;
	/** Данные, доступные компоненту через `MODAL_DATA` и `ModalRef.data`. */
	data?: TData;
	/**
	 * Инжектор компонента, из которого открывается окно. Позволяет динамическому
	 * контенту получать провайдеры родительского компонента.
	 */
	injector?: Injector;
}

/**
 * Сервис модальных окон.
 *
 * Создаёт окно в корне документа через `PortalService`, передаёт компоненту
 * контента `MODAL_DATA`, `MODAL_REF` и `MODAL_CLOSE` и возвращает `ModalRef`.
 *
 * ```ts
 * const modalRef = modalService.open<string, { id: number }>(ModalContent, {
 * 	title: 'Настройки',
 * 	data: { id: 1 },
 * 	injector: inject(Injector),
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
	private readonly portal = inject(PortalService);
	private readonly environmentInjector = inject(EnvironmentInjector);

	public open<TResult = unknown, TData = unknown>(
		component: Type<unknown>,
		config: ModalConfig<TData> = {}
	): ModalRef<TResult, TData> {
		const modalRef = new ModalRef<TResult, TData>(config.data as TData);
		const parentInjector = config.injector ?? this.environmentInjector;
		const modalInjector = Injector.create({
			parent: parentInjector,
			providers: [
				{ provide: MODAL_DATA, useFactory: (): TData | undefined => config.data },
				{ provide: MODAL_REF, useValue: modalRef },
				{
					provide: MODAL_CLOSE,
					useValue: (result?: unknown): void => modalRef.close(result as TResult),
				},
			],
		});

		const hostRef = this.portal.create(ModalHost, { injector: parentInjector });

		hostRef.componentRef.setInput('title', config.title);
		hostRef.componentRef.changeDetectorRef.detectChanges();
		modalRef.setCloseHandler(() => hostRef.close());
		hostRef.instance.closed.subscribe(() => modalRef.close());
		hostRef.instance.attach(component, modalInjector);

		return modalRef;
	}
}
