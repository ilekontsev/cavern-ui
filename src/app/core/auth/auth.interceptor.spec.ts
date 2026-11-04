import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { User } from './auth.models';
import { authInterceptor } from './auth.interceptor';

const USER: User = {
	id: '1',
	login: 'neo',
	role: 'user',
	type: 'standard',
	registeredAt: '2026-11-04T00:00:00.000Z',
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

describe('authInterceptor', () => {
	let client: HttpClient;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
			],
		});
		client = TestBed.inject(HttpClient);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	it('обновляет токен и повторяет запрос после 401', async () => {
		const promise = firstValueFrom(client.get<{ ok: boolean }>('/api/protected'));

		http
			.expectOne('/api/protected')
			.flush({ code: 'tokenExpired' }, { status: 401, statusText: 'Unauthorized' });
		await settle();

		const refresh = http.expectOne('/api/auth/refresh');
		expect(refresh.request.method).toBe('POST');
		refresh.flush({ user: USER });
		await settle();

		http.expectOne('/api/protected').flush({ ok: true });

		await expect(promise).resolves.toEqual({ ok: true });
	});

	it('сбрасывает сессию до гостевой, если refresh-токен недействителен', async () => {
		const promise = firstValueFrom(client.get('/api/protected'));

		http
			.expectOne('/api/protected')
			.flush({ code: 'tokenExpired' }, { status: 401, statusText: 'Unauthorized' });
		await settle();

		http
			.expectOne('/api/auth/refresh')
			.flush({ code: 'invalidRefreshToken' }, { status: 401, statusText: 'Unauthorized' });
		await settle();

		http.expectOne('/api/users/me').flush({ user: GUEST });

		await expect(promise).rejects.toMatchObject({ status: 401 });
	});
});
