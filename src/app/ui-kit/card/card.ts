import { Component, input } from '@angular/core';

@Component({
	selector: 'app-card',
	styleUrl: './card.scss',
	templateUrl: './card.html',
})
export class Card {
	public readonly heading = input<string>();
}
