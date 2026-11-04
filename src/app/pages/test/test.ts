import { Component } from '@angular/core';
import { Button, Icon, Input, Page } from '../../ui-kit';

@Component({
	imports: [Button, Icon, Input, Page],
	selector: 'app-test',
	styleUrl: './test.scss',
	templateUrl: './test.html',
})
export class Test {}
