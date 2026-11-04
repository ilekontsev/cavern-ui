import { DOCUMENT } from '@angular/common';
import {
	computed,
	Directive,
	effect,
	ElementRef,
	inject,
	Injector,
	input,
	OnDestroy,
	Renderer2,
	signal,
} from '@angular/core';

import { PortalRef, PortalService } from '../portal/portal.service';
import { TooltipBubble } from './tooltip-bubble';

const TOOLTIP_GAP = 8;
const VIEWPORT_MARGIN = 8;

/**
 * Всплывающая подсказка ui-kit.
 *
 * Атрибутная директива: показывает текст из `app-tooltip` при наведении или
 * фокусе на элементе. Если передать `null` или пустую строку, подсказки нет:
 * `<a [app-tooltip]="expanded() ? null : channel.name">…</a>`
 *
 * Визуальную часть рисует динамически созданный `TooltipBubble`. Он живёт
 * в портале поверх страницы, поэтому `overflow: hidden` у родителя не обрезает
 * подсказку, а хост-элементу не нужен `position: relative`.
 */
@Directive({
	// Тултип намеренно применяется к любому тегу, поэтому селектор атрибутный.
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[app-tooltip]',
})
export class Tooltip implements OnDestroy {
	private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly renderer = inject(Renderer2);
	private readonly portal = inject(PortalService);
	private readonly injector = inject(Injector);
	private readonly document = inject(DOCUMENT);

	public readonly appTooltip = input<string | null>(null, { alias: 'app-tooltip' });

	private readonly unlisten: (() => void)[] = [];
	private readonly hovered = signal(false);
	private readonly focused = signal(false);
	private readonly visible = computed(() => this.hovered() || this.focused());

	private bubbleRef: PortalRef<TooltipBubble> | null = null;

	private readonly onViewportChange = (): void => this.updatePosition();

	constructor() {
		const host = this.elementRef.nativeElement;

		this.unlisten.push(
			this.renderer.listen(host, 'pointerenter', () => this.hovered.set(true)),
			this.renderer.listen(host, 'pointerleave', () => this.hovered.set(false)),
			// Клик по кнопке оставляет её в фокусе, поэтому подсказку нужно
			// погасить вручную. Иначе она «зависает» до следующего blur.
			this.renderer.listen(host, 'click', () => {
				this.hovered.set(false);
				this.focused.set(false);
			}),
			// Показываем подсказку только для клавиатурного фокуса: после
			// клика мышью кнопка тоже получает focus, но подсказка не нужна.
			this.renderer.listen(host, 'focus', () => this.focused.set(host.matches(':focus-visible'))),
			this.renderer.listen(host, 'blur', () => this.focused.set(false))
		);

		effect(() => {
			const text = this.appTooltip()?.trim() ?? '';
			const visible = this.visible();

			if (!text) {
				this.removeBubble();
				return;
			}

			const bubble = this.bubbleRef ?? this.createBubble();

			bubble.componentRef.setInput('text', text);
			bubble.componentRef.setInput('visible', visible);
			bubble.componentRef.changeDetectorRef.detectChanges();
			this.updatePosition();
		});
	}

	public ngOnDestroy(): void {
		this.unlisten.forEach((unlisten) => unlisten());
		this.removeBubble();
	}

	private createBubble(): PortalRef<TooltipBubble> {
		const bubble = this.portal.create(TooltipBubble, { injector: this.injector });

		bubble.hostElement.style.pointerEvents = 'none';
		this.bubbleRef = bubble;
		this.document.addEventListener('scroll', this.onViewportChange, true);
		this.document.defaultView?.addEventListener('resize', this.onViewportChange);

		return bubble;
	}

	private removeBubble(): void {
		if (!this.bubbleRef) {
			return;
		}

		this.document.removeEventListener('scroll', this.onViewportChange, true);
		this.document.defaultView?.removeEventListener('resize', this.onViewportChange);
		this.bubbleRef.close();
		this.bubbleRef = null;
	}

	private updatePosition(): void {
		if (!this.bubbleRef) {
			return;
		}

		const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
		const bubbleElement = this.bubbleRef.hostElement;
		const bubbleRect = bubbleElement.getBoundingClientRect();
		const viewportWidth = this.document.defaultView?.innerWidth ?? hostRect.right;
		const viewportHeight = this.document.defaultView?.innerHeight ?? hostRect.bottom;

		let left = hostRect.right + TOOLTIP_GAP;

		if (left + bubbleRect.width > viewportWidth - VIEWPORT_MARGIN) {
			left = hostRect.left - TOOLTIP_GAP - bubbleRect.width;
		}

		left = Math.max(
			VIEWPORT_MARGIN,
			Math.min(left, viewportWidth - bubbleRect.width - VIEWPORT_MARGIN)
		);

		const top = Math.max(
			VIEWPORT_MARGIN + bubbleRect.height / 2,
			Math.min(
				hostRect.top + hostRect.height / 2,
				viewportHeight - VIEWPORT_MARGIN - bubbleRect.height / 2
			)
		);

		this.renderer.setStyle(bubbleElement, 'left', `${left}px`);
		this.renderer.setStyle(bubbleElement, 'top', `${top}px`);
	}
}
