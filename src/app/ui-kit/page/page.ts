import { Component, input } from '@angular/core';

@Component({
	selector: 'app-page',
	styleUrl: './page.scss',
	templateUrl: './page.html',
})
export class Page {
	public readonly title = input.required<string>();
	public readonly subtitle = input<string>();
}
