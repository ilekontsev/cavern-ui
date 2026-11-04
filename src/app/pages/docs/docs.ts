import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
	imports: [RouterLink, RouterLinkActive, RouterOutlet],
	selector: 'app-docs',
	styleUrl: './docs.scss',
	templateUrl: './docs.html',
})
export class Docs {}
