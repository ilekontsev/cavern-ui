import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { Channel } from '../../core/channels/channel.models';
import { ChannelService } from '../../core/channels/channel.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Card, Input, Page } from '../../ui-kit';

@Component({
	imports: [Button, Card, Input, Page, RouterLink],
	selector: 'app-channel-search',
	styleUrl: './channel-search.scss',
	templateUrl: './channel-search.html',
})
export class ChannelSearch implements OnInit {
	private readonly channelService = inject(ChannelService);
	private readonly router = inject(Router);

	protected readonly auth = inject(AuthService);
	protected readonly routeUrls = ROUTE_URLS;
	protected readonly channels = signal<Channel[]>([]);
	protected readonly searchQuery = signal('');
	protected readonly loading = signal(false);
	protected readonly actionId = signal<string | null>(null);
	protected readonly error = signal<string | null>(null);

	public ngOnInit(): void {
		void this.fetchChannels('');
	}

	protected submit(event: Event): void {
		event.preventDefault();
		void this.fetchChannels(this.searchQuery());
	}

	protected join(channel: Channel): void {
		void this.joinChannel(channel);
	}

	private async joinChannel(channel: Channel): Promise<void> {
		this.actionId.set(channel.id);
		this.error.set(null);

		try {
			const joined = await firstValueFrom(this.channelService.join(channel.id));

			await this.router.navigate([ROUTE_URLS.channels, joined.id]);
		} catch {
			this.error.set(`Не удалось присоединиться к каналу «${channel.name}».`);
		} finally {
			this.actionId.set(null);
		}
	}

	private async fetchChannels(search: string): Promise<void> {
		this.loading.set(true);

		try {
			this.channels.set(await firstValueFrom(this.channelService.list(search)));
			this.error.set(null);
		} catch {
			this.error.set('Не удалось загрузить каналы. Проверьте, что mock API запущен.');
		} finally {
			this.loading.set(false);
		}
	}
}
