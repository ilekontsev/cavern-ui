import { Routes } from '@angular/router';

import { ROUTE_SEGMENTS } from '../../core/routes';

export const routes: Routes = [
	{
		path: ROUTE_SEGMENTS.root,
		loadComponent: () => import('./home').then((m) => m.Home),
	},
];
