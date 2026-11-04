import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthError, User, UserRecord } from './auth.models';
import { AuthService } from './auth.service';

const RECORD: UserRecord = {
	id: '1',
	login: 'neo',
	password: 'password123',
	role: 'user',
	type: 'standard',
	registeredAt: '2026-11-04T00:00:00.000Z',
};

const USER: User = {
	id: RECORD.id,
	login: RECORD.login,
	role: RECORD.role,
	type: RECORD.type,
	registeredAt: RECORD.registeredAt,
};

const GUEST: User = {
	id: 'guest-1',
	login: 'guest',
	role: 'guest',
	type: 'standard',
	registeredAt: '2026-11-04T00:00:00.000Z',
};

function settle(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('AuthService', () => {
	let service: AuthService;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(AuthService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	it('загружает пользователя при старте приложения', async () => {
		const promise = firstValueFrom(service.loadCurrentUser());

		const request = http.expectOne('/api/users/me');
		expect(request.request.method).toBe('GET');
		request.flush({ user: USER });

		const user = await promise;
		expect(user.login).toBe('neo');
		expect(service.currentUser()).toEqual(USER);
		expect(service.isAuthenticated()).toBe(true);
	});

	it('получает гостевую сессию с уникальным id, если не авторизован', async () => {
		const promise = firstValueFrom(service.loadCurrentUser());

		http.expectOne('/api/users/me').flush({ user: GUEST });

		const user = await promise;
		expect(user.role).toBe('guest');
		expect(user.id).toBe('guest-1');
		expect(service.currentUser()).toEqual(GUEST);
		expect(service.isAuthenticated()).toBe(false);
	});

	it('регистрирует пользователя', async () => {
		const promise = service.register({ login: 'neo', password: 'password123' });

		const request = http.expectOne('/api/auth/register');
		expect(request.request.method).toBe('POST');
		expect(request.request.body).toEqual({ login: 'neo', password: 'password123' });
		request.flush({ user: USER }, { status: 201, statusText: 'Created' });

		const user = await promise;
		expect(user.login).toBe('neo');
		expect(service.isAuthenticated()).toBe(true);
	});

	it('не регистрирует занятый логин', async () => {
		const promise = service.register({ login: 'neo', password: 'password123' });

		http
			.expectOne('/api/auth/register')
			.flush({ code: 'loginTaken' }, { status: 409, statusText: 'Conflict' });

		await expect(promise).rejects.toMatchObject<Partial<AuthError>>({ code: 'loginTaken' });
	});

	it('авторизует пользователя при совпадении пароля', async () => {
		const promise = service.login({ login: 'neo', password: 'password123' });

		const request = http.expectOne('/api/auth/login');
		expect(request.request.method).toBe('POST');
		request.flush({ user: USER });

		const user = await promise;
		expect(user.login).toBe('neo');
		expect(service.isAuthenticated()).toBe(true);
	});

	it('отклоняет неверный пароль', async () => {
		const promise = service.login({ login: 'neo', password: 'wrong-password' });

		http
			.expectOne('/api/auth/login')
			.flush({ code: 'invalidCredentials' }, { status: 401, statusText: 'Unauthorized' });

		await expect(promise).rejects.toMatchObject<Partial<AuthError>>({
			code: 'invalidCredentials',
		});
	});

	it('обновляет сессию через refresh-токен', async () => {
		const promise = firstValueFrom(service.refreshSession());

		const request = http.expectOne('/api/auth/refresh');
		expect(request.request.method).toBe('POST');
		request.flush({ user: USER });

		await promise;
		expect(service.currentUser()).toEqual(USER);
	});

	it('не дублирует параллельные запросы на обновление токена', async () => {
		const first = firstValueFrom(service.refreshSession());
		const second = firstValueFrom(service.refreshSession());

		http.expectOne('/api/auth/refresh').flush({ user: USER });

		await Promise.all([first, second]);
		expect(service.currentUser()).toEqual(USER);
	});

	it('очищает сессию при выходе и становится гостем', async () => {
		firstValueFrom(service.loadCurrentUser());
		http.expectOne('/api/users/me').flush({ user: USER });

		const promise = service.logout();

		http.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
		await settle();

		http.expectOne('/api/users/me').flush({ user: GUEST });
		await promise;

		expect(service.currentUser()).toEqual(GUEST);
		expect(service.isAuthenticated()).toBe(false);
	});
});
