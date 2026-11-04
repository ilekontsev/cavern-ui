import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

class MediaQueryListStub extends EventTarget {
	public onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null = null;

	constructor(
		public readonly media: string,
		public matches: boolean
	) {
		super();
	}
}

function installMatchMedia(matches: boolean): MediaQueryListStub {
	const mediaQueryList = new MediaQueryListStub(DARK_QUERY, matches);
	window.matchMedia = (() =>
		mediaQueryList as unknown as MediaQueryList) as typeof window.matchMedia;

	return mediaQueryList;
}

function emitSystemThemeChange(mediaQueryList: MediaQueryListStub, matches: boolean): void {
	mediaQueryList.dispatchEvent(Object.assign(new Event('change'), { matches }));
}

describe('ThemeService', () => {
	afterEach(() => {
		delete document.documentElement.dataset['theme'];
	});

	it('по умолчанию использует системную тёмную тему', () => {
		installMatchMedia(true);
		TestBed.configureTestingModule({});

		const service = TestBed.inject(ThemeService);
		TestBed.tick();

		expect(service.mode()).toBe('system');
		expect(service.theme()).toBe('dark');
		expect(document.documentElement.dataset['theme']).toBe('dark');
	});

	it('по умолчанию использует системную светлую тему', () => {
		installMatchMedia(false);
		TestBed.configureTestingModule({});

		const service = TestBed.inject(ThemeService);
		TestBed.tick();

		expect(service.mode()).toBe('system');
		expect(service.theme()).toBe('light');
		expect(document.documentElement.dataset['theme']).toBe('light');
	});

	it('toggle переключает тему на противоположную и фиксирует режим', () => {
		installMatchMedia(true);
		TestBed.configureTestingModule({});

		const service = TestBed.inject(ThemeService);
		TestBed.tick();

		service.toggle();
		TestBed.tick();

		expect(service.mode()).toBe('light');
		expect(service.theme()).toBe('light');
		expect(document.documentElement.dataset['theme']).toBe('light');
	});

	it('следит за сменой системной темы, пока режим system', () => {
		const mediaQueryList = installMatchMedia(false);
		TestBed.configureTestingModule({});

		const service = TestBed.inject(ThemeService);
		TestBed.tick();
		expect(service.theme()).toBe('light');

		emitSystemThemeChange(mediaQueryList, true);
		TestBed.tick();

		expect(service.theme()).toBe('dark');
		expect(document.documentElement.dataset['theme']).toBe('dark');
	});

	it('не реагирует на смену системной темы после ручного выбора', () => {
		const mediaQueryList = installMatchMedia(true);
		TestBed.configureTestingModule({});

		const service = TestBed.inject(ThemeService);
		TestBed.tick();

		service.toggle();
		emitSystemThemeChange(mediaQueryList, true);
		TestBed.tick();

		expect(service.theme()).toBe('light');
	});
});
