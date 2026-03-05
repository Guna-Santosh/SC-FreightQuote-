import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Address, FreightLineItem, QuoteResponse, OrderItem } from './models';

@Injectable({ providedIn: 'root' })
export class FreightService {

  getOrderDetails(orderNumber: string): Observable<{ source: Partial<Address>; destination: Partial<Address>; items: OrderItem[] }> {
    const mockData = {
      source: {
        companyName: 'Acme Manufacturing Corp',
        contactName: 'John Doe',
        addressLine1: '123 Industrial Blvd',
        addressLine2: 'Suite 200',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        phoneNumber: '(415) 555-0199'
      },
      destination: {
        companyName: 'Global Distribution Inc.',
        contactName: 'Jane Smith',
        addressLine1: '456 Commerce Drive',
        addressLine2: 'Building B',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
        phoneNumber: '(512) 555-0100'
      },
      items: [
        { description: 'Industrial Compressor Unit', quantity: 2 },
        { description: 'Pneumatic Valve Set (12-pack)', quantity: 15 },
        { description: 'Control Panel Assembly', quantity: 1 }
      ]
    };
    return of(mockData).pipe(delay(1200));
  }

  getQuotes(
    source: Address,
    destination: Address,
    lineItems: FreightLineItem[],
    carriers: string[]
  ): Observable<QuoteResponse[]> {

    if (Math.random() < 0.1) {
      return throwError(() => new Error('Quote service temporarily unavailable. Please try again.'));
    }

    const quotes: QuoteResponse[] = carriers.map(carrierName => {
      const base = Math.floor(Math.random() * 600) + 250;
      const fuel = Math.round(base * 0.165 * 100) / 100;
      const accessorial = Math.floor(Math.random() * 75) + 10;
      const transitDays = Math.floor(Math.random() * 6) + 1;
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + transitDays + 1);

      return {
        carrierName,
        serviceType: transitDays <= 2 ? 'Express' : transitDays <= 4 ? 'Standard' : 'Economy',
        transitDays,
        totalCharge: Math.round((base + fuel + accessorial) * 100) / 100,
        fuelSurcharge: fuel,
        accessorialCharges: accessorial,
        estimatedDeliveryDate: delivery,
        selected: false
      };
    });

    quotes.sort((a, b) => a.totalCharge - b.totalCharge);
    return of(quotes).pipe(delay(2000));
  }
}
