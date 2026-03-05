import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FreightService } from './freight.service';
import { PackageType, Address, FreightLineItem, QuoteResponse } from './models';
import { MessageService } from 'primeng/api';

import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { Skeleton } from 'primeng/skeleton';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-freight-quote',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    Card, Divider, InputText, InputNumber, InputMask,
    Select, MultiSelect, Button, TableModule,
    Checkbox, RadioButton, Skeleton, Toast, Tag,
    IconField, InputIcon, Dialog, ToggleSwitch
  ],
  providers: [MessageService],
  templateUrl: './freight-quote.component.html',
  styleUrls: ['./freight-quote.component.scss']
})
export class FreightQuoteComponent implements OnInit {
  quoteForm!: FormGroup;
  orderNumberInput = '';
  loading = false;
  fetchingOrder = false;
  quotes: QuoteResponse[] = [];
  selectedQuote: QuoteResponse | null = null;
  showResults = false;
  displayAdditionalServices = false;

  private fb = inject(FormBuilder);
  private freightService = inject(FreightService);
  private messageService = inject(MessageService);

  packageTypes = [
    { label: 'Pallet', value: PackageType.PALLET },
    { label: 'Carton', value: PackageType.CARTON },
    { label: 'Crate', value: PackageType.CRATE },
    { label: 'Drum', value: PackageType.DRUM }
  ];

  freightClasses = [
    '50','55','60','65','70','77.5','85','92.5','100',
    '110','125','150','175','200','250','300','400','500'
  ].map(c => ({ label: `Class ${c}`, value: c }));

  states = [
    {label:'Alabama',value:'AL'},{label:'Alaska',value:'AK'},{label:'Arizona',value:'AZ'},
    {label:'Arkansas',value:'AR'},{label:'California',value:'CA'},{label:'Colorado',value:'CO'},
    {label:'Connecticut',value:'CT'},{label:'Delaware',value:'DE'},{label:'Florida',value:'FL'},
    {label:'Georgia',value:'GA'},{label:'Hawaii',value:'HI'},{label:'Idaho',value:'ID'},
    {label:'Illinois',value:'IL'},{label:'Indiana',value:'IN'},{label:'Iowa',value:'IA'},
    {label:'Kansas',value:'KS'},{label:'Kentucky',value:'KY'},{label:'Louisiana',value:'LA'},
    {label:'Maine',value:'ME'},{label:'Maryland',value:'MD'},{label:'Massachusetts',value:'MA'},
    {label:'Michigan',value:'MI'},{label:'Minnesota',value:'MN'},{label:'Mississippi',value:'MS'},
    {label:'Missouri',value:'MO'},{label:'Montana',value:'MT'},{label:'Nebraska',value:'NE'},
    {label:'Nevada',value:'NV'},{label:'New Hampshire',value:'NH'},{label:'New Jersey',value:'NJ'},
    {label:'New Mexico',value:'NM'},{label:'New York',value:'NY'},{label:'North Carolina',value:'NC'},
    {label:'North Dakota',value:'ND'},{label:'Ohio',value:'OH'},{label:'Oklahoma',value:'OK'},
    {label:'Oregon',value:'OR'},{label:'Pennsylvania',value:'PA'},{label:'Rhode Island',value:'RI'},
    {label:'South Carolina',value:'SC'},{label:'South Dakota',value:'SD'},{label:'Tennessee',value:'TN'},
    {label:'Texas',value:'TX'},{label:'Utah',value:'UT'},{label:'Vermont',value:'VT'},
    {label:'Virginia',value:'VA'},{label:'Washington',value:'WA'},{label:'West Virginia',value:'WV'},
    {label:'Wisconsin',value:'WI'},{label:'Wyoming',value:'WY'}
  ];

  countries = [
    { label: 'United States', value: 'USA' },
    { label: 'Canada', value: 'CAN' },
    { label: 'Mexico', value: 'MEX' }
  ];

  carriers = [
    { label: 'FedEx Freight', value: 'FedEx Freight' },
    { label: 'UPS Freight', value: 'UPS Freight' },
    { label: 'Old Dominion', value: 'Old Dominion' },
    { label: 'XPO Logistics', value: 'XPO Logistics' },
    { label: 'Estes Express', value: 'Estes Express' },
    { label: 'R+L Carriers', value: 'R+L Carriers' },
    { label: 'SAIA', value: 'SAIA' },
    { label: 'TForce Freight', value: 'TForce Freight' }
  ];

  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      source: this.createAddressForm(),
      destination: this.createAddressForm(),
      orderItems: this.fb.array([this.createOrderItem(), this.createOrderItem()]),
      freightItems: this.fb.array([this.createFreightItem()]),
      selectedCarriers: [[], [Validators.required, Validators.minLength(1)]],
      additionalServices: this.fb.group({
        callBeforeDelivery: [false],
        appointmentDelivery: [false],
        residentialDelivery: [false],
        insideDelivery: [false],
        liftgatePickup: [false],
        holidayPickup: [false],
        limitedAccessPickup: [false],
        topLoadOnly: [false],
        overStackPickup: [false],
        overLength: [false],
        extremeLength: [false],
        overWeight: [false],
        residentialPickup: [false],
        limitedAccessDelivery: [false],
        liftgateDelivery: [false],
        insidePickup: [false]
      })
    });
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      companyName: ['', Validators.required],
      contactName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [null, Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
      country: [null, Validators.required],
      phoneNumber: ['', Validators.required]
    });
  }

  createOrderItem(desc = '', qty = 1): FormGroup {
    return this.fb.group({
      description: [desc, Validators.required],
      quantity: [qty, [Validators.required, Validators.min(1)]]
    });
  }

  createFreightItem(): FormGroup {
    return this.fb.group({
      packageType: [null, Validators.required],
      description: ['', Validators.required],
      length: [null, [Validators.required, Validators.min(0.1)]],
      width: [null, [Validators.required, Validators.min(0.1)]],
      height: [null, [Validators.required, Validators.min(0.1)]],
      weight: [null, [Validators.required, Validators.min(0.1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      nmfcCode: [''],
      freightClass: [null, Validators.required],
      hazardous: [false]
    });
  }

  get orderItems(): FormArray { return this.quoteForm.get('orderItems') as FormArray; }
  get freightItems(): FormArray { return this.quoteForm.get('freightItems') as FormArray; }

  asFormGroup(ctrl: any): FormGroup { return ctrl as FormGroup; }

  addFreightItem(): void { this.freightItems.push(this.createFreightItem()); }
  removeFreightItem(i: number): void { if (this.freightItems.length > 1) this.freightItems.removeAt(i); }

  toggleAdditionalServices(): void {
    this.displayAdditionalServices = !this.displayAdditionalServices;
  }

  get totalWeight(): number {
    return this.freightItems.controls.reduce((sum, c) =>
      sum + ((c.get('weight')?.value || 0) * (c.get('quantity')?.value || 0)), 0);
  }

  isInvalid(path: string): boolean {
    const c = this.quoteForm.get(path);
    return !!(c?.invalid && (c?.touched || c?.dirty));
  }

  getCarrierInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getSeverity(serviceType: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' | 'contrast' {
    const s = serviceType.toLowerCase();
    if (s.includes('express')) return 'danger';
    if (s.includes('standard')) return 'info';
    return 'success';
  }

  onFetchOrder(): void {
    if (!this.orderNumberInput.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please enter an order number.' });
      return;
    }
    this.fetchingOrder = true;
    this.freightService.getOrderDetails(this.orderNumberInput).subscribe({
      next: (data) => {
        this.quoteForm.patchValue({ source: data.source, destination: data.destination });
        this.orderItems.clear();
        data.items.forEach(item => this.orderItems.push(this.createOrderItem(item.description, item.quantity)));
        this.messageService.add({ severity: 'success', summary: 'Order Loaded!', detail: `Order "${this.orderNumberInput}" details pre-filled.` });
        this.fetchingOrder = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Not Found', detail: 'Order not found. Please enter manually.' });
        this.fetchingOrder = false;
      }
    });
  }

  onGetQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.' });
      return;
    }
    this.loading = true;
    this.quotes = [];
    this.showResults = false;
    this.selectedQuote = null;
    const v = this.quoteForm.value;
    this.freightService.getQuotes(v.source, v.destination, v.freightItems, v.selectedCarriers).subscribe({
      next: (results) => {
        this.quotes = results;
        this.loading = false;
        this.showResults = true;
        const best = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results[0].totalCharge);
        this.messageService.add({ severity: 'success', summary: '🎯 Quotes Ready!', detail: `${results.length} quotes found. Best rate: ${best}` });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Quote Failed', detail: err.message });
        this.loading = false;
      }
    });
  }
}
