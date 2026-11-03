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

	for (const url of ['/', '/profile', '/test', '/login', '/register']) {
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
