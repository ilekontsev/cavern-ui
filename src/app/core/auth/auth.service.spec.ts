import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthError, UserRecord } from './auth.models';
import { AuthService } from './auth.service';

const RECORD: UserRecord = {
	id: '1',
	login: 'neo',
	password: 'password123',
	role: 'user',
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
		localStorage.clear();
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(AuthService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
		localStorage.clear();
	});

	it('регистрирует пользователя и добавляет роль, тип и дату регистрации', async () => {
		const promise = service.register({ login: 'neo', password: 'password123' });

		http
			.expectOne(
				(request) => request.url === '/api/users' && request.params.get('login:eq') === 'neo'
			)
			.flush([]);
		await settle();

		const create = http.expectOne('/api/users');
		expect(create.request.method).toBe('POST');

		const body = create.request.body as Omit<UserRecord, 'id'>;
		expect(body.login).toBe('neo');
		expect(body.role).toBe('user');
		expect(body.type).toBe('standard');
		expect(body).not.toHaveProperty('id');
		expect(Number.isNaN(Date.parse(body.registeredAt))).toBe(false);
		create.flush({ ...body, id: '1' });

		const user = await promise;
		expect(user.login).toBe('neo');
		expect(user).not.toHaveProperty('password');
		expect(service.currentUser()?.login).toBe('neo');
	});

	it('не регистрирует занятый логин', async () => {
		const promise = service.register({ login: 'neo', password: 'password123' });

		http.expectOne((request) => request.url === '/api/users').flush([RECORD]);

		await expect(promise).rejects.toMatchObject<Partial<AuthError>>({ code: 'loginTaken' });
	});

	it('авторизует пользователя при совпадении пароля', async () => {
		const promise = service.login({ login: 'neo', password: 'password123' });

		http.expectOne((request) => request.url === '/api/users').flush([RECORD]);

		const user = await promise;
		expect(user.login).toBe('neo');
		expect(service.isAuthenticated()).toBe(true);
	});

	it('отклоняет неверный пароль', async () => {
		const promise = service.login({ login: 'neo', password: 'wrong-password' });

		http.expectOne((request) => request.url === '/api/users').flush([RECORD]);

		await expect(promise).rejects.toMatchObject<Partial<AuthError>>({
			code: 'invalidCredentials',
		});
	});

	it('сохраняет сессию и очищает её при выходе', async () => {
		const promise = service.login({ login: 'neo', password: 'password123' });

		http.expectOne((request) => request.url === '/api/users').flush([RECORD]);
		await promise;

		expect(localStorage.getItem('cavern.auth.user')).toContain('neo');

		service.logout();

		expect(service.currentUser()).toBeNull();
		expect(localStorage.getItem('cavern.auth.user')).toBeNull();
	});
});
