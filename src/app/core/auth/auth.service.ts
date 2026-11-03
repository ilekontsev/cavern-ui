import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api';
import {
	AuthError,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_TYPE,
	LoginPayload,
	RegisterPayload,
	User,
	UserRecord,
} from './auth.models';

const SESSION_KEY = 'cavern.auth.user';

/**
 * Состояние авторизации на сигналах.
 *
 * Пока данные лежат в json-server. Когда появится бэкенд, достаточно заменить
 * запросы ниже (URL уже идёт через /api) — компоненты и формы менять не нужно.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly currentUserState = signal<User | null>(this.restoreSession());

	readonly currentUser = this.currentUserState.asReadonly();
	readonly isAuthenticated = computed(() => this.currentUserState() !== null);

	async register(payload: RegisterPayload): Promise<User> {
		const login = payload.login.trim();
		const existing = await this.findByLogin(login);

		if (existing) {
			throw new AuthError('loginTaken');
		}

		const record: Omit<UserRecord, 'id'> = {
			login,
			password: payload.password,
			role: DEFAULT_USER_ROLE,
			type: DEFAULT_USER_TYPE,
			registeredAt: new Date().toISOString(),
		};

		const created = await firstValueFrom(
			this.http.post<UserRecord>(`${API_BASE_URL}/users`, record)
		);

		return this.startSession(created);
	}

	async login(payload: LoginPayload): Promise<User> {
		const record = await this.findByLogin(payload.login.trim());

		if (!record || record.password !== payload.password) {
			throw new AuthError('invalidCredentials');
		}

		return this.startSession(record);
	}

	logout(): void {
		this.currentUserState.set(null);
		this.removeSession();
	}

	private async findByLogin(login: string): Promise<UserRecord | null> {
		const users = await firstValueFrom(
			this.http.get<UserRecord[]>(`${API_BASE_URL}/users`, {
				params: { 'login:eq': login },
			})
		);

		return users[0] ?? null;
	}

	private startSession(record: UserRecord): User {
		const user: User = {
			id: record.id,
			login: record.login,
			role: record.role,
			type: record.type,
			registeredAt: record.registeredAt,
		};

		this.currentUserState.set(user);
		this.persistSession(user);

		return user;
	}

	private restoreSession(): User | null {
		try {
			const stored = localStorage.getItem(SESSION_KEY);

			return stored ? (JSON.parse(stored) as User) : null;
		} catch {
			return null;
		}
	}

	private persistSession(user: User): void {
		try {
			localStorage.setItem(SESSION_KEY, JSON.stringify(user));
		} catch {
			// Приватный режим браузера может запрещать запись — сессия останется только в памяти.
		}
	}

	private removeSession(): void {
		try {
			localStorage.removeItem(SESSION_KEY);
		} catch {
			// См. persistSession.
		}
	}
}
