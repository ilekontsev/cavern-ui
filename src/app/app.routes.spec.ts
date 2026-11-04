import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { ROUTE_URLS } from './core/routes';

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
		ROUTE_URLS.home,
		ROUTE_URLS.profile,
		ROUTE_URLS.sandbox,
		ROUTE_URLS.docs,
		ROUTE_URLS.docsButton,
		ROUTE_URLS.docsInput,
		ROUTE_URLS.docsIcon,
		ROUTE_URLS.docsLoader,
		ROUTE_URLS.docsModal,
		ROUTE_URLS.login,
		ROUTE_URLS.register,
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

		expect(router.url).toBe(ROUTE_URLS.home);
	});
});
