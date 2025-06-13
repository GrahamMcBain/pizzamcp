// Type definitions for the Domino's API integration

export interface DominosStore {
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

export interface DominosMenuItem {
  Code: string;
  Name: string;
  Description?: string;
  Price: number;
  Category: string;
  Size?: string;
  Tags?: string[];
}

export interface OrderItem {
  name: string;
  code: string;
  size?: string;
  quantity: number;
  price?: number;
  options?: Record<string, any>;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  raw?: string;
}

export interface PaymentInfo {
  card_number: string;
  expiration: string;
  cvv: string;
  zip_code: string;
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  customerInfo: CustomerInfo;
  deliveryAddress?: DeliveryAddress;
  store?: DominosStore;
}

export interface OrderValidationResult {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface OrderPricingResult {
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

export interface OrderPlacementResult {
  success: boolean;
  result?: {
    Order: {
      OrderID: string;
      EstimatedWaitMinutes: number;
    };
  };
  message?: string;
}

// MCP Tool action types
export type OrderAction = 
  | 'start'
  | 'find_store'
  | 'get_menu' 
  | 'add_item'
  | 'remove_item'
  | 'get_summary'
  | 'set_customer_info'
  | 'place_order';

export interface OrderPizzaArgs {
  action: OrderAction;
  address?: string;
  item_name?: string;
  item_code?: string;
  size?: string;
  quantity?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_info?: PaymentInfo;
  tip_amount?: number;
  menu_category?: string;
  remove_index?: number;
}
