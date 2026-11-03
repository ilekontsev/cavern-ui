import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { Test } from './test/test';

describe('pages', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [provideRouter([]), provideHttpClient()],
		}).compileComponents();
	});

	it('home показывает ссылки на профиль и тест', async () => {
		const fixture = TestBed.createComponent(Home);
		await fixture.whenStable();
		const element = fixture.nativeElement as HTMLElement;

		expect(element.querySelector('h1')?.textContent).toContain('Cavern');
		expect([...element.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
			'/profile',
			'/test',
		]);
	});

	it('profile показывает заголовок раздела', async () => {
		const fixture = TestBed.createComponent(Profile);
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
			'Профиль'
		);
	});

	it('test показывает заголовок раздела', async () => {
		const fixture = TestBed.createComponent(Test);
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
			'Тест'
		);
	});

	it('login показывает поля логина и пароля', async () => {
		const fixture = TestBed.createComponent(Login);
		await fixture.whenStable();
		const element = fixture.nativeElement as HTMLElement;

		expect(element.querySelectorAll('input')).toHaveLength(2);
	});

	it('register показывает логин, пароль и повтор пароля', async () => {
		const fixture = TestBed.createComponent(Register);
		await fixture.whenStable();
		const element = fixture.nativeElement as HTMLElement;

		expect(element.querySelectorAll('input')).toHaveLength(3);
	});
});
