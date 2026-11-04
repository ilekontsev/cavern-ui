import { Routes } from '@angular/router';

import { DEFAULT_SUBCHANNEL_ID } from '../../core/channels/channel.constants';
import { CHANNELS_ROUTE_SEGMENTS, ROUTE_SEGMENTS, ROUTE_URLS } from '../../core/routes';

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
				path: ':id/:subchannelId',
				loadComponent: () => import('./channel-detail').then((m) => m.ChannelDetail),
			},
			{
				// Канал всегда открывается на подканале: так при переключении
				// подканалов компонент страницы не пересоздаётся.
				path: ':id',
				pathMatch: 'full',
				redirectTo: ({ params }) =>
					`${ROUTE_URLS.channels}/${params['id']}/${DEFAULT_SUBCHANNEL_ID}`,
			},
		],
	},
];
