import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Channel, ChannelMember } from '../../core/channels/channel.models';
import { ChannelService } from '../../core/channels/channel.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Card, Icon, Page } from '../../ui-kit';
import { SubchannelSidebar } from './subchannel-sidebar';

@Component({
	imports: [Button, Card, Icon, Page, RouterLink, SubchannelSidebar],
	selector: 'app-channel-detail',
	styleUrl: './channel-detail.scss',
	templateUrl: './channel-detail.html',
})
export class ChannelDetail {
	private readonly channelService = inject(ChannelService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly routeUrls = ROUTE_URLS;
	protected readonly channel = signal<Channel | null>(null);
	protected readonly members = signal<ChannelMember[]>([]);
	protected readonly loading = signal(true);
	protected readonly membersLoading = signal(false);
	protected readonly deleting = signal(false);
	protected readonly removingMemberId = signal<string | null>(null);
	protected readonly error = signal<string | null>(null);
	protected readonly membersError = signal<string | null>(null);

	private loadId = 0;

	constructor() {
		this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
			const id = params.get('id');

			if (id) {
				// Переключение подканалов меняет только URL — канал уже загружен.
				if (this.channel()?.id !== id) {
					void this.loadChannel(id);
				}

				return;
			}

			this.channel.set(null);
			this.members.set([]);
			this.membersLoading.set(false);
			this.membersError.set(null);
			this.loading.set(false);
			this.error.set('Канал не найден.');
		});
	}

	protected deleteChannel(): void {
		void this.removeChannel();
	}

	protected removeMember(member: ChannelMember): void {
		void this.removeMemberFromChannel(member);
	}

	protected initials(login: string): string {
		return login.trim().slice(0, 1).toUpperCase();
	}

	private async loadChannel(id: string): Promise<void> {
		const loadId = ++this.loadId;

		this.loading.set(true);
		this.error.set(null);
		this.members.set([]);
		this.membersLoading.set(false);
		this.membersError.set(null);

		try {
			const channel = await firstValueFrom(this.channelService.get(id));

			if (loadId === this.loadId) {
				this.channel.set(channel);
				this.loading.set(false);
				void this.loadMembers(id, loadId);
			}
		} catch {
			if (loadId === this.loadId) {
				this.channel.set(null);
				this.error.set('Канал не найден или недоступен.');
			}
		} finally {
			if (loadId === this.loadId) {
				this.loading.set(false);
			}
		}
	}

	private async loadMembers(id: string, loadId: number): Promise<void> {
		this.membersLoading.set(true);
		this.membersError.set(null);

		try {
			const members = await firstValueFrom(this.channelService.members(id));

			if (loadId === this.loadId) {
				this.members.set(members);
			}
		} catch {
			if (loadId === this.loadId) {
				this.membersError.set('Не удалось загрузить участников.');
			}
		} finally {
			if (loadId === this.loadId) {
				this.membersLoading.set(false);
			}
		}
	}

	private async removeMemberFromChannel(member: ChannelMember): Promise<void> {
		const channel = this.channel();

		if (!channel) {
			return;
		}

		this.removingMemberId.set(member.id);
		this.membersError.set(null);

		try {
			const members = await firstValueFrom(this.channelService.removeMember(channel.id, member.id));

			this.members.set(members);
			this.channel.update((current) =>
				current ? { ...current, membersCount: members.length } : current
			);
		} catch {
			this.membersError.set(`Не удалось удалить участника «${member.login}».`);
		} finally {
			this.removingMemberId.set(null);
		}
	}

	private async removeChannel(): Promise<void> {
		const channel = this.channel();

		if (!channel) {
			return;
		}

		this.deleting.set(true);
		this.error.set(null);

		try {
			await firstValueFrom(this.channelService.remove(channel.id));
			await this.router.navigateByUrl(ROUTE_URLS.channels);
		} catch {
			this.error.set(`Не удалось удалить канал «${channel.name}».`);
		} finally {
			this.deleting.set(false);
		}
	}
}
