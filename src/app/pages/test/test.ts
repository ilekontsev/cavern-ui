import { Component, signal } from '@angular/core';
import { Button, Icon, Input, Loader, Page } from '../../ui-kit';

@Component({
	imports: [Button, Icon, Input, Loader, Page],
	selector: 'app-test',
	styleUrl: './test.scss',
	templateUrl: './test.html',
})
export class Test {
	protected readonly buttonLoading = signal(false);
}
