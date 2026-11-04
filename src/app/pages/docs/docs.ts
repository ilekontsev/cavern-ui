import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ROUTE_URLS } from '../../core/routes';

@Component({
	imports: [RouterLink, RouterLinkActive, RouterOutlet],
	selector: 'app-docs',
	styleUrl: './docs.scss',
	templateUrl: './docs.html',
})
export class Docs {
	protected readonly routeUrls = ROUTE_URLS;
}
