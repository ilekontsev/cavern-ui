import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./pages/home/home.routes').then((m) => m.routes),
	},
	{
		path: 'profile',
		loadChildren: () => import('./pages/profile/profile.routes').then((m) => m.routes),
	},
	{
		path: 'test',
		loadChildren: () => import('./pages/test/test.routes').then((m) => m.routes),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
