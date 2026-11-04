import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import {
	Observable,
	catchError,
	finalize,
	firstValueFrom,
	map,
	of,
	shareReplay,
	throwError,
} from 'rxjs';
import { API_BASE_URL } from '../api';
import { AuthError, LoginPayload, RegisterPayload, User } from './auth.models';

interface AuthResponse {
	user: User;
}

/**
 * Состояние авторизации на сигналах.
 *
 * Токены хранятся в HttpOnly-cookie и недоступны из JS. При старте приложение
 * запрашивает GET /users/me: сервер вернёт либо текущего пользователя, либо
 * создаст гостя с уникальным id.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly currentUserState = signal<User | null>(null);
	private refreshInFlight$: Observable<User> | null = null;

	readonly currentUser: Signal<User | null> = this.currentUserState.asReadonly();
	readonly authenticatedUser = computed(() => {
		const user = this.currentUserState();

		return user && user.role !== 'guest' ? user : null;
	});
	readonly isAuthenticated = computed(() => this.authenticatedUser() !== null);

	/** Загружает пользователя с сервера или создаёт гостевую сессию. */
	loadCurrentUser(): Observable<User> {
		return this.http
			.get<AuthResponse>(`${API_BASE_URL}/users/me`, { withCredentials: true })
			.pipe(map(({ user }) => this.setCurrentUser(user)));
	}

	async register(payload: RegisterPayload): Promise<User> {
		return firstValueFrom(
			this.http
				.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload, {
					withCredentials: true,
				})
				.pipe(
					map(({ user }) => this.setCurrentUser(user)),
					catchError((error: unknown) => throwError(() => this.toAuthError(error)))
				)
		);
	}

	async login(payload: LoginPayload): Promise<User> {
		return firstValueFrom(
			this.http
				.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload, {
					withCredentials: true,
				})
				.pipe(
					map(({ user }) => this.setCurrentUser(user)),
					catchError((error: unknown) => throwError(() => this.toAuthError(error)))
				)
		);
	}

	async logout(): Promise<void> {
		try {
			await firstValueFrom(
				this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true })
			);
		} catch {
			// Выход должен работать и при недоступном API.
		}

		this.currentUserState.set(null);

		try {
			await firstValueFrom(this.loadCurrentUser());
		} catch {
			// Если API недоступен, остаёмся без пользователя до следующего запроса.
		}
	}

	/** Обновляет access-токен через refresh-cookie. Параллельные вызовы ждут один запрос. */
	refreshSession(): Observable<User> {
		const inFlight = this.refreshInFlight$;

		if (inFlight) {
			return inFlight;
		}

		const request$ = this.http
			.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
			.pipe(
				map(({ user }) => this.setCurrentUser(user)),
				finalize(() => {
					this.refreshInFlight$ = null;
				}),
				shareReplay({ bufferSize: 1, refCount: false })
			);

		this.refreshInFlight$ = request$;

		return request$;
	}

	/** Сбрасывает сессию и запрашивает у сервера новую гостевую. */
	expireSession(): Observable<void> {
		this.currentUserState.set(null);

		return this.loadCurrentUser().pipe(
			map(() => undefined),
			catchError(() => of(undefined))
		);
	}

	private setCurrentUser(user: User): User {
		this.currentUserState.set(user);

		return user;
	}

	private toAuthError(error: unknown): unknown {
		if (error instanceof HttpErrorResponse) {
			const code = (error.error as { code?: string } | null)?.code;

			if (code === 'invalidCredentials' || code === 'loginTaken') {
				return new AuthError(code);
			}
		}

		return error;
	}
}
