import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { USER_ROLE_LABELS, USER_TYPE_LABELS } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
import { ROUTE_URLS } from '../../core/routes';
import { Button, Card, Page } from '../../ui-kit';

@Component({
	imports: [Button, Card, DatePipe, Page, RouterLink],
	selector: 'app-profile',
	styleUrl: './profile.scss',
	templateUrl: './profile.html',
})
export class Profile {
	protected readonly auth = inject(AuthService);
	protected readonly currentUser = this.auth.authenticatedUser;
	protected readonly routeUrls = ROUTE_URLS;
	protected readonly roleLabels = USER_ROLE_LABELS;
	protected readonly typeLabels = USER_TYPE_LABELS;
}
