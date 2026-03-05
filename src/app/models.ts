export enum PackageType {
  PALLET = 'Pallet',
  CARTON = 'Carton',
  CRATE = 'Crate',
  DRUM = 'Drum'
}

export interface Address {
  companyName: string;
  contactName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface FreightLineItem {
  packageType: PackageType;
  description: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  nmfcCode?: string;
  freightClass: string;
  hazardous: boolean;
}

export interface Carrier {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface QuoteResponse {
  carrierName: string;
  serviceType: string;
  transitDays: number;
  totalCharge: number;
  fuelSurcharge: number;
  accessorialCharges: number;
  estimatedDeliveryDate: Date;
  selected?: boolean;
}

export interface OrderItem {
  description: string;
  quantity: number;
}

export interface SelectOption {
  label: string;
  value: string;
}
