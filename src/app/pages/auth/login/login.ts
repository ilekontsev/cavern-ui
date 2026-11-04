import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthError } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { ROUTE_URLS } from '../../../core/routes';
import { Button, Input, Page } from '../../../ui-kit';

interface LoginFormModel {
	login: string;
	password: string;
}

@Component({
	imports: [Button, FormField, FormRoot, Input, Page, RouterLink],
	selector: 'app-login',
	styleUrl: '../auth-form.scss',
	templateUrl: './login.html',
})
export class Login {
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly model = signal<LoginFormModel>({ login: '', password: '' });
	protected readonly routeUrls = ROUTE_URLS;

	protected readonly loginForm = form(
		this.model,
		(path) => {
			required(path.login, { message: 'Введите логин' });
			required(path.password, { message: 'Введите пароль' });
			minLength(path.password, 8, { message: 'Пароль должен содержать минимум 8 символов' });
		},
		{
			submission: {
				action: async (field) => {
					try {
						await this.auth.login(field().value());
						await this.router.navigateByUrl(ROUTE_URLS.profile);

						return null;
					} catch (error) {
						if (error instanceof AuthError && error.code === 'invalidCredentials') {
							return {
								kind: 'invalidCredentials',
								message: 'Неверный логин или пароль',
								fieldTree: field.password,
							};
						}

						return {
							kind: 'serverError',
							message: 'Не удалось войти. Убедитесь, что json-server запущен.',
						};
					}
				},
			},
		}
	);
}
