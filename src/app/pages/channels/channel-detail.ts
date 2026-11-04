import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Channel } from '../../core/channels/channel.models';
import { ChannelService } from '../../core/channels/channel.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Card, Page } from '../../ui-kit';

@Component({
	imports: [Button, Card, Page, RouterLink],
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
	protected readonly loading = signal(true);
	protected readonly deleting = signal(false);
	protected readonly error = signal<string | null>(null);

	private loadId = 0;

	constructor() {
		this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
			const id = params.get('id');

			if (id) {
				void this.loadChannel(id);
				return;
			}

			this.channel.set(null);
			this.loading.set(false);
			this.error.set('Канал не найден.');
		});
	}

	protected deleteChannel(): void {
		void this.removeChannel();
	}

	private async loadChannel(id: string): Promise<void> {
		const loadId = ++this.loadId;

		this.loading.set(true);
		this.error.set(null);

		try {
			const channel = await firstValueFrom(this.channelService.get(id));

			if (loadId === this.loadId) {
				this.channel.set(channel);
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
