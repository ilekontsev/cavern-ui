import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Card, Page } from '../../ui-kit';

@Component({
	imports: [Button, Card, Page, RouterLink],
	selector: 'app-home',
	styleUrl: './home.scss',
	templateUrl: './home.html',
})
export class Home {}
