import { Routes } from '@angular/router';

import { DOCS_ROUTE_SEGMENTS, ROUTE_SEGMENTS } from '../../core/routes';

export const routes: Routes = [
	{
		path: ROUTE_SEGMENTS.root,
		loadComponent: () => import('./docs').then((m) => m.Docs),
		children: [
			{
				path: ROUTE_SEGMENTS.root,
				pathMatch: 'full',
				redirectTo: DOCS_ROUTE_SEGMENTS.button,
			},
			{
				path: DOCS_ROUTE_SEGMENTS.button,
				loadComponent: () => import('./button/button').then((m) => m.DocsButton),
			},
			{
				path: DOCS_ROUTE_SEGMENTS.input,
				loadComponent: () => import('./input/input').then((m) => m.DocsInput),
			},
			{
				path: DOCS_ROUTE_SEGMENTS.icon,
				loadComponent: () => import('./icon/icon').then((m) => m.DocsIcon),
			},
			{
				path: DOCS_ROUTE_SEGMENTS.loader,
				loadComponent: () => import('./loader/loader').then((m) => m.DocsLoader),
			},
			{
				path: DOCS_ROUTE_SEGMENTS.modal,
				loadComponent: () => import('./modal/modal').then((m) => m.DocsModal),
			},
			{
				path: DOCS_ROUTE_SEGMENTS.tooltip,
				loadComponent: () => import('./tooltip/tooltip').then((m) => m.DocsTooltip),
			},
		],
	},
];
