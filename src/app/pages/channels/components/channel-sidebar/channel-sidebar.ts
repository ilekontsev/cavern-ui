import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Channel } from '../../../../core/channels/channel.models';
import { ROUTE_URLS } from '../../../../core/routes';
import { Button, Icon, Loader, Tooltip } from '../../../../ui-kit';

/**
 * Боковое меню каналов.
 *
 * В свёрнутом виде показывает только аватары каналов; подсказка с названием
 * появляется при наведении. Кнопка в шапке разворачивает меню до полного вида.
 */
@Component({
	imports: [Button, Icon, Loader, RouterLink, RouterLinkActive, Tooltip],
	selector: 'app-channel-sidebar',
	styleUrl: './channel-sidebar.scss',
	templateUrl: './channel-sidebar.html',
	host: {
		'[attr.data-expanded]': 'expanded() ? "" : null',
	},
})
export class ChannelSidebar {
	public readonly channels = input.required<readonly Channel[]>();
	public readonly loading = input(false);
	public readonly error = input<string | null>(null);

	protected readonly routeUrls = ROUTE_URLS;
	protected readonly expanded = signal(false);

	protected toggle(): void {
		this.expanded.update((value) => !value);
	}

	protected initials(name: string): string {
		return name.trim().slice(0, 1).toUpperCase();
	}
}
