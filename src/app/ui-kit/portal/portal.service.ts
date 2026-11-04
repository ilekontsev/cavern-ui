import {
	ApplicationRef,
	ComponentRef,
	DOCUMENT,
	EnvironmentInjector,
	Injectable,
	Injector,
	Type,
	createComponent,
	inject,
} from '@angular/core';

/** Настройки динамического портала. */
export interface PortalConfig {
	/** Родительский инжектор, из которого создаётся компонент. */
	injector?: Injector;
	/** DOM-узлы, проецируемые во входы компонента. */
	projectableNodes?: Node[][];
}

/**
 * Ссылка на динамически созданный портал.
 *
 * Содержит компонент, его контейнер и назначенный слой `z-index`.
 * `close()` уничтожает компонент и удаляет контейнер из DOM.
 */
export class PortalRef<C> {
	private destroyed = false;

	constructor(
		readonly componentRef: ComponentRef<C>,
		readonly container: HTMLElement,
		readonly zIndex: number,
		private readonly destroy: () => void
	) {}

	get instance(): C {
		return this.componentRef.instance;
	}

	get hostElement(): HTMLElement {
		return this.componentRef.location.nativeElement as HTMLElement;
	}

	close(): void {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;
		this.destroy();
	}
}

/**
 * Сервис динамических порталов.
 *
 * Создаёт контейнер в корне документа и монтирует в него Angular-компонент.
 * Каждому порталу выдаётся следующий `z-index`, поэтому вложенные окна и
 * будущие поповеры автоматически оказываются выше предыдущих.
 *
 * Сервис не зависит от приложения и подходит для модальных окон, дропдаунов,
 * тултипов и других оверлеев.
 */
@Injectable({ providedIn: 'root' })
export class PortalService {
	private readonly applicationRef = inject(ApplicationRef);
	private readonly environmentInjector = inject(EnvironmentInjector);
	private readonly document = inject(DOCUMENT);

	private nextZIndex = 1000;

	create<C>(component: Type<C>, config: PortalConfig = {}): PortalRef<C> {
		const container = this.document.createElement('div');
		const zIndex = this.nextZIndex++;

		container.className = 'app-portal';
		Object.assign(container.style, {
			position: 'fixed',
			inset: '0',
			zIndex: `${zIndex}`,
			pointerEvents: 'none',
		});

		const componentRef = createComponent(component, {
			environmentInjector: this.environmentInjector,
			elementInjector: config.injector ?? this.environmentInjector,
			projectableNodes: config.projectableNodes,
		});

		const hostElement = componentRef.location.nativeElement as HTMLElement;
		hostElement.style.pointerEvents = 'auto';

		container.append(hostElement);
		this.document.body.append(container);
		this.applicationRef.attachView(componentRef.hostView);
		componentRef.changeDetectorRef.detectChanges();

		return new PortalRef(componentRef, container, zIndex, () => {
			this.applicationRef.detachView(componentRef.hostView);
			componentRef.destroy();
			container.remove();
		});
	}
}
