import { Component, input } from '@angular/core';

@Component({
	selector: 'app-card',
	styleUrl: './card.scss',
	templateUrl: './card.html',
})
export class Card {
	readonly heading = input<string>();
}
