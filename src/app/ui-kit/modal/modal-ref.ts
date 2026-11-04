let nextModalId = 0;

/**
 * Ссылка на модальное окно, открытое через `ModalService`.
 *
 * Содержит переданные данные, позволяет закрыть окно и дождаться результата.
 */
export class ModalRef<TResult = unknown, TData = unknown> {
	readonly id = nextModalId++;
	readonly afterClosed: Promise<TResult | undefined>;

	private closeHandler?: (result?: TResult) => void;
	private closed = false;
	private resolveClosed!: (result: TResult | undefined) => void;

	constructor(readonly data: TData) {
		this.afterClosed = new Promise((resolve) => {
			this.resolveClosed = resolve;
		});
	}

	close(result?: TResult): void {
		if (this.closed) {
			return;
		}

		this.closed = true;
		this.closeHandler?.(result);
		this.resolveClosed(result);
	}

	/** @internal Используется `ModalService` для привязки к порталу. */
	setCloseHandler(handler: (result?: TResult) => void): void {
		this.closeHandler = handler;
	}
}
