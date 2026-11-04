import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Channel } from '../../core/channels/channel.models';
import { ChannelService } from '../../core/channels/channel.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Icon } from '../../ui-kit';

@Component({
	imports: [Button, Icon, RouterLink, RouterLinkActive, RouterOutlet],
	selector: 'app-channels',
	styleUrl: './channels.scss',
	templateUrl: './channels.html',
})
export class Channels {
	private readonly auth = inject(AuthService);
	private readonly channelService = inject(ChannelService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly router = inject(Router);

	protected readonly routeUrls = ROUTE_URLS;
	protected readonly myChannels = signal<Channel[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal<string | null>(null);

	constructor() {
		this.router.events
			.pipe(
				filter((event): event is NavigationEnd => event instanceof NavigationEnd),
				filter((event) => event.urlAfterRedirects.startsWith(ROUTE_URLS.channels)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe(() => void this.loadMyChannels());
	}

	private async loadMyChannels(): Promise<void> {
		if (!this.auth.currentUser()) {
			this.myChannels.set([]);
			this.error.set(null);
			this.loading.set(false);
			return;
		}

		if (!this.myChannels().length) {
			this.loading.set(true);
		}

		try {
			this.myChannels.set(await firstValueFrom(this.channelService.mine()));
			this.error.set(null);
		} catch {
			this.myChannels.set([]);
			this.error.set('Не удалось загрузить каналы. Проверьте, что mock API запущен.');
		} finally {
			this.loading.set(false);
		}
	}
}
