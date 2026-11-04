import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Channels } from './channels/channels';
import { Docs } from './docs/docs';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { Sandbox } from './sandbox/sandbox';

describe('pages', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [provideRouter([]), provideHttpClient()],
		}).compileComponents();
	});

	it('home показывает заголовок', async () => {
		const fixture = TestBed.createComponent(Home);
		await fixture.whenStable();
		const element = fixture.nativeElement as HTMLElement;

		expect(element.querySelector('h1')?.textContent).toContain('Cavern');
	});

	it('profile показывает заголовок раздела', async () => {
		const fixture = TestBed.createComponent(Profile);
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
			'Профиль'
		);
	});

	it('sandbox показывает заголовок раздела', async () => {
		const fixture = TestBed.createComponent(Sandbox);
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
			'Песочница'
		);
	});

	it('channels показывает боковое меню', async () => {
		const fixture = TestBed.createComponent(Channels);

		fixture.detectChanges();

		expect(
			(fixture.nativeElement as HTMLElement).querySelector('.channels__title')?.textContent
		).toContain('Каналы');
	});

	it('docs показывает навигацию по компонентам', async () => {
		const fixture = TestBed.createComponent(Docs);
		await fixture.whenStable();
		const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.docs__link')];

		expect(links.map((link) => link.textContent?.trim())).toEqual([
			'Button',
			'Input',
			'Icon',
			'Loader',
		]);
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
