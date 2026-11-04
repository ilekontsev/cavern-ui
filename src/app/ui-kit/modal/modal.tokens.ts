import { InjectionToken } from '@angular/core';
import type { ModalRef } from './modal-ref';

/** Функция закрытия модального окна, доступная внутри динамического компонента. */
export type ModalClose = (result?: unknown) => void;

/** Данные, переданные в `ModalService.open()`. */
export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');

/** Ссылка на открытое модальное окно. */
export const MODAL_REF = new InjectionToken<ModalRef>('MODAL_REF');

/** Функция закрытия текущего модального окна. */
export const MODAL_CLOSE = new InjectionToken<ModalClose>('MODAL_CLOSE');
