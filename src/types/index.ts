export type ProductUnit =
  | 'Piece'
  | 'Kg'
  | 'Gram'
  | 'Litre'
  | 'Bottle'
  | 'Box'
  | 'Packet'
  | 'Bag'
  | 'Dozen';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: ProductUnit;
  currentStock: number; // can be decimal e.g. 2.5 kg or 1.25 L
  minStock: number;
  buyingPrice?: number;
  sellingPrice: number; // retail price
  wholesalePrice?: number; // default wholesale rate
  barcode?: string;
  image?: string; // emoji or preset icon or image url
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  gstin?: string;
  customerPrices: Record<string, number>; // productId -> negotiated price
  isArchived?: boolean;
  createdAt: string;
  notes?: string;
}

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'cancelled';

export interface QuoteItem {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  standardPrice: number; // for showing negotiated discount comparison
  isPriceOverridden?: boolean;
  discount: number; // in currency or %
  discountType?: 'flat' | 'percent';
  taxRate?: number; // e.g. 5 or 18
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. QT-2026-001
  customerId: string;
  customerName: string;
  customerBusiness: string;
  customerPhone: string;
  customerAddress?: string;
  customerGstin?: string;
  items: QuoteItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharge: number;
  grandTotal: number;
  notes?: string;
  validUntil: string;
  status: QuoteStatus;
  createdAt: string;
  convertedOrderId?: string;
}

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  fulfilledQuantity: number;
  pendingQuantity: number; // for partial orders/backorders
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-2026-001
  quotationId?: string;
  quotationNumber?: string;
  customerId: string;
  customerName: string;
  customerBusiness: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  status: OrderStatus;
  stockDeducted: boolean;
  stockDeductedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type StockMovementReason =
  | 'Sale'
  | 'Damaged'
  | 'Expired'
  | 'Personal use'
  | 'Adjustment'
  | 'Supplier delivery'
  | 'Order fulfillment'
  | 'Order cancellation return'
  | 'Manual stock in'
  | 'Other';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  unit: ProductUnit;
  reason: StockMovementReason;
  supplier?: string;
  purchasePrice?: number;
  referenceNumber?: string;
  notes?: string;
  date: string;
  user: string;
  orderId?: string;
}

export type InventoryDeductTrigger = 'on_create' | 'on_confirm' | 'on_deliver';

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  gstin?: string;
  currency: string;
  inventoryDeductTrigger: InventoryDeductTrigger;
  allowNegativeStock: boolean;
  defaultQuoteValidityDays: number;
  defaultNotes: string;
  defaultTaxRate: number; // e.g. 0% or 5%
  enableTax: boolean;
  whatsappMessageTemplate: string;
  isOnboarded: boolean;
}

export type ActiveTab = 'home' | 'products' | 'customers' | 'quotes' | 'orders' | 'settings';
