import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme';

@Component({
	imports: [RouterLink, RouterLinkActive, RouterOutlet],
	selector: 'app-root',
	styleUrl: './app.scss',
	templateUrl: './app.html',
})
export class App {
	private readonly themeService = inject(ThemeService);

	protected readonly theme = this.themeService.theme;

	protected toggleTheme(): void {
		this.themeService.toggle();
	}
}
