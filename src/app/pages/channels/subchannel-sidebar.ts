import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { DEFAULT_SUBCHANNEL_ID } from '../../core/channels/channel.constants';
import { ROUTE_URLS } from '../../core/routes';
import { Icon } from '../../ui-kit';

interface Subchannel {
	id: string;
	name: string;
	kind: 'text' | 'voice';
	/** Есть непрочитанные сообщения. */
	unread?: boolean;
}

interface SubchannelGroup {
	id: string;
	name: string;
	subchannels: readonly Subchannel[];
}

/**
 * Демо-данные: подканалы пока не приходят с API.
 * Список одинаковый для всех каналов.
 */
const SUBCHANNEL_GROUPS: readonly SubchannelGroup[] = [
	{
		id: 'text',
		name: 'Текстовые каналы',
		subchannels: [
			{ id: DEFAULT_SUBCHANNEL_ID, name: 'general', kind: 'text' },
			{ id: 'sub-2', name: 'announcements', kind: 'text' },
			{ id: 'sub-3', name: 'off-topic', kind: 'text' },
		],
	},
	{
		id: 'voice',
		name: 'Голосовые каналы',
		subchannels: [
			{ id: 'sub-4', name: 'Голосовой чат', kind: 'voice' },
			{ id: 'sub-5', name: 'Киновечер', kind: 'voice' },
		],
	},
];

/** Боковое меню подканалов канала в духе Discord. */
@Component({
	imports: [Icon, RouterLink, RouterLinkActive],
	selector: 'app-subchannel-sidebar',
	styleUrl: './subchannel-sidebar.scss',
	templateUrl: './subchannel-sidebar.html',
})
export class SubchannelSidebar {
	public readonly channelId = input.required<string>();

	protected readonly groups = SUBCHANNEL_GROUPS;
	protected readonly routeUrls = ROUTE_URLS;
	protected readonly collapsedGroups = signal<ReadonlySet<string>>(new Set());

	protected isGroupCollapsed(id: string): boolean {
		return this.collapsedGroups().has(id);
	}

	protected toggleGroup(id: string): void {
		this.collapsedGroups.update((current) => {
			const next = new Set(current);

			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}

			return next;
		});
	}
}
