import { Component, input } from '@angular/core';

/**
 * Визуальная часть подсказки.
 *
 * Создаётся динамически директивой `Tooltip`, поэтому снаружи не используется
 * и не экспортируется из ui-kit.
 */
@Component({
	selector: 'app-tooltip-bubble',
	styleUrl: './tooltip-bubble.scss',
	template: '{{ text() }}',
	host: {
		'[attr.data-visible]': 'visible() ? "" : null',
	},
})
export class TooltipBubble {
	public readonly text = input('');
	public readonly visible = input(false);
}
