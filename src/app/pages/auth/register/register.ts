import { Component, inject, signal } from '@angular/core';
import {
	form,
	FormField,
	FormRoot,
	maxLength,
	minLength,
	pattern,
	required,
	validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { AuthError } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { ROUTE_URLS } from '../../../core/routes';
import { Button, Input, Page } from '../../../ui-kit';

const LOGIN_MIN_LENGTH = 3;
const LOGIN_MAX_LENGTH = 32;
const PASSWORD_MIN_LENGTH = 8;

interface RegisterFormModel {
	login: string;
	password: string;
	confirmPassword: string;
}

@Component({
	imports: [Button, FormField, FormRoot, Input, Page, RouterLink],
	selector: 'app-register',
	styleUrl: '../auth-form.scss',
	templateUrl: './register.html',
})
export class Register {
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly model = signal<RegisterFormModel>({
		login: '',
		password: '',
		confirmPassword: '',
	});
	protected readonly routeUrls = ROUTE_URLS;

	protected readonly registerForm = form(
		this.model,
		(path) => {
			required(path.login, { message: 'Введите логин' });
			minLength(path.login, LOGIN_MIN_LENGTH, {
				message: `Логин должен содержать минимум ${LOGIN_MIN_LENGTH} символа`,
			});
			maxLength(path.login, LOGIN_MAX_LENGTH, {
				message: `Логин должен содержать максимум ${LOGIN_MAX_LENGTH} символа`,
			});
			pattern(path.login, /^[a-zA-Z0-9_-]+$/, {
				message: 'Логин может содержать только латиницу, цифры, _ и -',
			});

			required(path.password, { message: 'Введите пароль' });
			minLength(path.password, PASSWORD_MIN_LENGTH, {
				message: `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`,
			});

			required(path.confirmPassword, { message: 'Повторите пароль' });
			validate(path.confirmPassword, ({ value, valueOf }) => {
				if (value() !== valueOf(path.password)) {
					return {
						kind: 'passwordMismatch',
						message: 'Пароли не совпадают',
					};
				}

				return null;
			});
		},
		{
			submission: {
				action: async (field) => {
					try {
						await this.auth.register(field().value());
						await this.router.navigateByUrl(ROUTE_URLS.profile);

						return null;
					} catch (error) {
						if (error instanceof AuthError && error.code === 'loginTaken') {
							return {
								kind: 'loginTaken',
								message: 'Такой логин уже занят',
								fieldTree: field.login,
							};
						}

						return {
							kind: 'serverError',
							message: 'Не удалось зарегистрироваться. Убедитесь, что json-server запущен.',
						};
					}
				},
			},
		}
	);
}
