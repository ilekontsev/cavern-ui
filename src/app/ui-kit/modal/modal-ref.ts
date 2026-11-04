let nextModalId = 0;

/**
 * Ссылка на модальное окно, открытое через `ModalService`.
 *
 * Содержит переданные данные, позволяет закрыть окно и дождаться результата.
 */
export class ModalRef<TResult = unknown, TData = unknown> {
	public readonly id = nextModalId++;
	public readonly afterClosed: Promise<TResult | undefined>;

	private closeHandler?: (result?: TResult) => void;
	private closed = false;
	private resolveClosed!: (result: TResult | undefined) => void;

	constructor(public readonly data: TData) {
		this.afterClosed = new Promise((resolve) => {
			this.resolveClosed = resolve;
		});
	}

	public close(result?: TResult): void {
		if (this.closed) {
			return;
		}

		this.closed = true;
		this.closeHandler?.(result);
		this.resolveClosed(result);
	}

	/** @internal Используется `ModalService` для привязки к порталу. */
	public setCloseHandler(handler: (result?: TResult) => void): void {
		this.closeHandler = handler;
	}
}
