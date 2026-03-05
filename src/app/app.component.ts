import { Component } from '@angular/core';
import { FreightQuoteComponent } from './freight-quote.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FreightQuoteComponent],
  template: `<app-freight-quote></app-freight-quote>`,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class AppComponent {}
