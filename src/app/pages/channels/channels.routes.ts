import { Routes } from '@angular/router';
import { CHANNELS_ROUTE_SEGMENTS, ROUTE_SEGMENTS } from '../../core/routes';

export const routes: Routes = [
	{
		path: ROUTE_SEGMENTS.root,
		loadComponent: () => import('./channels').then((m) => m.Channels),
		children: [
			{
				path: ROUTE_SEGMENTS.root,
				loadComponent: () => import('./channels-home').then((m) => m.ChannelsHome),
			},
			{
				path: CHANNELS_ROUTE_SEGMENTS.newChannel,
				loadComponent: () => import('./channel-create').then((m) => m.ChannelCreate),
			},
			{
				path: CHANNELS_ROUTE_SEGMENTS.search,
				loadComponent: () => import('./channel-search').then((m) => m.ChannelSearch),
			},
			{
				path: ':id',
				loadComponent: () => import('./channel-detail').then((m) => m.ChannelDetail),
			},
		],
	},
];
