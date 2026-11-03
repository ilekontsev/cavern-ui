import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card, Page } from '../../ui-kit';

@Component({
	imports: [RouterLink, Card, Page],
	selector: 'app-home',
	styleUrl: './home.scss',
	templateUrl: './home.html',
})
export class Home {}
