import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { ChannelService } from '../../../core/channels/channel.service';
import { ROUTE_URLS } from '../../../core/routes';
import { Button, Card, Input, Page } from '../../../ui-kit';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 64;
const DESCRIPTION_MAX_LENGTH = 500;

interface ChannelCreateFormModel {
	name: string;
	description: string;
}

@Component({
	imports: [Button, Card, FormField, FormRoot, Input, Page, RouterLink],
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
	protected readonly model = signal<ChannelCreateFormModel>({ name: '', description: '' });

	protected readonly channelForm = form(
		this.model,
		(path) => {
			validate(path.name, ({ value }) => {
				const name = value().trim();

				if (name.length < NAME_MIN_LENGTH) {
					return {
						kind: 'nameMinLength',
						message: `Название должно содержать минимум ${NAME_MIN_LENGTH} символа.`,
					};
				}

				if (name.length > NAME_MAX_LENGTH) {
					return {
						kind: 'nameMaxLength',
						message: `Название должно содержать максимум ${NAME_MAX_LENGTH} символа.`,
					};
				}

				return null;
			});

			validate(path.description, ({ value }) => {
				if (value().trim().length > DESCRIPTION_MAX_LENGTH) {
					return {
						kind: 'descriptionMaxLength',
						message: `Описание должно содержать максимум ${DESCRIPTION_MAX_LENGTH} символов.`,
					};
				}

				return null;
			});
		},
		{
			submission: {
				action: async (field) => {
					const { name, description } = field().value();

					try {
						const channel = await firstValueFrom(
							this.channelService.create({
								name: name.trim(),
								description: description.trim(),
							})
						);

						await this.router.navigate([ROUTE_URLS.channels, channel.id]);

						return null;
					} catch {
						return {
							kind: 'serverError',
							message: 'Не удалось создать канал. Проверьте, что mock API запущен.',
						};
					}
				},
			},
		}
	);
}
