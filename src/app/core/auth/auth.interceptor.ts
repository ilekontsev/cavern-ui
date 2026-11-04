import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api';
import { AuthService } from './auth.service';

const AUTH_ENDPOINTS = [
	`${API_BASE_URL}/auth/login`,
	`${API_BASE_URL}/auth/register`,
	`${API_BASE_URL}/auth/refresh`,
	`${API_BASE_URL}/auth/logout`,
];

function isAuthEndpoint(url: string): boolean {
	return AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));
}

/**
 * На 401 пробует обновить access-токен и повторить запрос.
 * Если refresh-токен недействителен — сбрасывает сессию до гостевой.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const auth = inject(AuthService);

	return next(request).pipe(
		catchError((error: unknown) => {
			if (
				!(error instanceof HttpErrorResponse) ||
				error.status !== 401 ||
				isAuthEndpoint(request.url)
			) {
				return throwError(() => error);
			}

			return auth.refreshSession().pipe(
				catchError((refreshError: unknown) =>
					auth.expireSession().pipe(switchMap(() => throwError(() => refreshError)))
				),
				switchMap(() => next(request))
			);
		})
	);
};
