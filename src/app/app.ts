import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ROUTE_URLS } from './core/routes';
import { ThemeService } from './core/theme';
import { Button } from './ui-kit';

@Component({
	imports: [Button, RouterLink, RouterLinkActive, RouterOutlet],
	selector: 'app-root',
	styleUrl: './app.scss',
	templateUrl: './app.html',
})
export class App {
	private readonly themeService = inject(ThemeService);
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly theme = this.themeService.theme;
	protected readonly currentUser = this.auth.currentUser;
	protected readonly routeUrls = ROUTE_URLS;

	protected toggleTheme(): void {
		this.themeService.toggle();
	}

	protected logout(): void {
		this.auth.logout();
		void this.router.navigateByUrl(ROUTE_URLS.home);
	}
}
