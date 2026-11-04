import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './core/routes';

export const routes: Routes = [
	{
		path: ROUTE_SEGMENTS.root,
		loadChildren: () => import('./pages/home/home.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.profile,
		loadChildren: () => import('./pages/profile/profile.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.docs,
		loadChildren: () => import('./pages/docs/docs.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.sandbox,
		loadChildren: () => import('./pages/sandbox/sandbox.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.login,
		loadChildren: () => import('./pages/auth/login/login.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.register,
		loadChildren: () => import('./pages/auth/register/register.routes').then((m) => m.routes),
	},
	{
		path: ROUTE_SEGMENTS.wildcard,
		redirectTo: ROUTE_SEGMENTS.root,
	},
];
