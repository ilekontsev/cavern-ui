import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
	ApplicationConfig,
	inject,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { catchError, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		provideHttpClient(withInterceptors([authInterceptor])),
		provideAppInitializer(() => {
			// Загружаем пользователя до первого рендера: сервер вернёт его данные
			// или создаст гостевую сессию с уникальным id.
			return inject(AuthService)
				.loadCurrentUser()
				.pipe(catchError(() => of(undefined)));
		}),
	],
};
