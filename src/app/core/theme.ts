import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Тема оформления. По умолчанию берётся из системных настроек,
 * переключение кнопкой фиксирует явный выбор до перезагрузки страницы.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly media: MediaQueryList | null = window.matchMedia?.(DARK_QUERY) ?? null;
	private readonly systemTheme = signal<Theme>(this.media?.matches ? 'dark' : 'light');

	readonly mode = signal<ThemeMode>('system');
	readonly theme = computed<Theme>(() => {
		const mode = this.mode();

		return mode === 'system' ? this.systemTheme() : mode;
	});

	constructor() {
		this.media?.addEventListener('change', this.onSystemThemeChange);
		inject(DestroyRef).onDestroy(() =>
			this.media?.removeEventListener('change', this.onSystemThemeChange)
		);

		effect(() => {
			document.documentElement.dataset['theme'] = this.theme();
		});
	}

	toggle(): void {
		this.mode.set(this.theme() === 'dark' ? 'light' : 'dark');
	}

	private readonly onSystemThemeChange = (event: MediaQueryListEvent): void => {
		this.systemTheme.set(event.matches ? 'dark' : 'light');
	};
}
