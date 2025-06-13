// Type declarations for the 'dominos' npm package

declare module 'dominos' {
  export interface StoreData {
    success: boolean;
    message?: string;
    result?: {
      Stores?: Store[];
    };
  }

  export interface Store {
    StoreID: string;
    StoreName: string;
    Phone: string;
    StreetName: string;
    City: string;
    Region: string;
    PostalCode: string;
    IsOnlineCapable: boolean;
    IsDeliveryStore: boolean;
    IsCarryoutStore: boolean;
    IsOpen: boolean;
    MinDistance: number;
  }

  export interface MenuData {
    success?: boolean;
    result?: {
      Menu?: {
        Categories?: Category[];
      };
    };
  }

  export interface Category {
    Name: string;
    Products?: Product[];
  }

  export interface Product {
    Code: string;
    Name: string;
    Description?: string;
    Price?: number;
  }

  export interface CustomerOptions {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }

  export interface OrderOptions {
    customer: Customer;
    storeID: string;
    deliveryMethod: 'Delivery' | 'Carryout';
  }

  export interface ItemOptions {
    code: string;
    qty: number;
  }

  export interface PaymentOptions {
    amount: number;
    number: string;
    expiration: string;
    securityCode: string;
    postalCode: string;
    tipAmount?: number;
  }

  export interface ValidationResult {
    success: boolean;
    message?: string;
  }

  export interface PricingResult {
    success: boolean;
    result?: {
      Order: {
        Amounts: {
          Customer: number;
          Menu: number;
          Tax: number;
          Delivery: number;
        };
      };
    };
    message?: string;
  }

  export interface OrderResult {
    success: boolean;
    result?: {
      Order: {
        OrderID: string;
        EstimatedWaitMinutes: number;
      };
    };
    message?: string;
  }

  export class Customer {
    constructor(options: CustomerOptions);
  }

  export class Order {
    customer: Customer;
    storeID: string;
    orderID?: string;
    estimatedWaitMinutes?: number;
    amountsBreakdown?: {
      customer: number;
      tax: number;
      delivery: number;
    };
    payments: Payment[];

    constructor(customer: Customer);
    addItem(item: Item): void;
    validate(): Promise<void>;
    price(): Promise<void>;
    place(): Promise<void>;
  }

  export class Item {
    constructor(options: ItemOptions);
  }

  export class Payment {
    constructor(options: PaymentOptions);
  }

  export class Menu {
    constructor(storeID: string, callback: (menuData: MenuData) => void);
  }

  export namespace Util {
    export function findNearbyStores(
      address: string,
      type: 'Delivery' | 'Carryout',
      callback: (storeData: StoreData) => void
    ): void;
  }
}
