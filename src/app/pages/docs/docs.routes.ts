import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./docs').then((m) => m.Docs),
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'button',
			},
			{
				path: 'button',
				loadComponent: () => import('./button/button').then((m) => m.DocsButton),
			},
			{
				path: 'input',
				loadComponent: () => import('./input/input').then((m) => m.DocsInput),
			},
			{
				path: 'icon',
				loadComponent: () => import('./icon/icon').then((m) => m.DocsIcon),
			},
			{
				path: 'loader',
				loadComponent: () => import('./loader/loader').then((m) => m.DocsLoader),
			},
		],
	},
];
