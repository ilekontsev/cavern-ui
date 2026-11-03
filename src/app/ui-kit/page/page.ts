import { Component, input } from '@angular/core';

@Component({
	selector: 'app-page',
	styleUrl: './page.scss',
	templateUrl: './page.html',
})
export class Page {
	readonly title = input.required<string>();
	readonly subtitle = input<string>();
}
