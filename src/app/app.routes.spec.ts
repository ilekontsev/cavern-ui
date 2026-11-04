import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

function leafRoute(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
	let current = snapshot;

	while (current.firstChild) {
		current = current.firstChild;
	}

	return current;
}

describe('app routes', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
	});

	const urls = [
		'/',
		'/profile',
		'/sandbox',
		'/docs',
		'/docs/button',
		'/docs/input',
		'/docs/icon',
		'/docs/loader',
		'/login',
		'/register',
	];

	for (const url of urls) {
		it(`лениво загружает ${url}`, async () => {
			const router = TestBed.inject(Router);

			await router.navigateByUrl(url);

			expect(leafRoute(router.routerState.root.snapshot).component).toBeTruthy();
		});
	}

	it('неизвестный URL редиректит на стартовый экран', async () => {
		const router = TestBed.inject(Router);

		await router.navigateByUrl('/unknown');

		expect(router.url).toBe('/');
	});
});
