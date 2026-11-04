import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ChannelService } from '../../core/channels/channel.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Card, Input, Page } from '../../ui-kit';

const NAME_MAX_LENGTH = 64;
const DESCRIPTION_MAX_LENGTH = 500;

@Component({
	imports: [Button, Card, Input, Page, RouterLink],
	selector: 'app-channel-create',
	styleUrl: './channel-create.scss',
	templateUrl: './channel-create.html',
})
export class ChannelCreate {
	private readonly auth = inject(AuthService);
	private readonly channelService = inject(ChannelService);
	private readonly router = inject(Router);

	protected readonly canCreate = this.auth.isAuthenticated;
	protected readonly routeUrls = ROUTE_URLS;
	protected readonly name = signal('');
	protected readonly description = signal('');
	protected readonly error = signal<string | null>(null);
	protected readonly creating = signal(false);

	protected submit(event: Event): void {
		event.preventDefault();
		void this.createChannel();
	}

	private async createChannel(): Promise<void> {
		const name = this.name().trim();
		const description = this.description().trim();

		if (name.length < 2) {
			this.error.set('Название должно содержать минимум 2 символа.');
			return;
		}

		if (name.length > NAME_MAX_LENGTH) {
			this.error.set(`Название должно содержать максимум ${NAME_MAX_LENGTH} символа.`);
			return;
		}

		if (description.length > DESCRIPTION_MAX_LENGTH) {
			this.error.set(`Описание должно содержать максимум ${DESCRIPTION_MAX_LENGTH} символов.`);
			return;
		}

		this.creating.set(true);
		this.error.set(null);

		try {
			const channel = await firstValueFrom(this.channelService.create({ name, description }));

			await this.router.navigate([ROUTE_URLS.channels, channel.id]);
		} catch {
			this.error.set('Не удалось создать канал. Проверьте, что mock API запущен.');
		} finally {
			this.creating.set(false);
		}
	}
}
