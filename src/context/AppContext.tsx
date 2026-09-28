import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Product,
  Customer,
  Quotation,
  Order,
  StockMovement,
  ShopSettings,
  ActiveTab,
  QuoteStatus,
  OrderStatus,
  StockMovementReason,
} from '../types';
import {
  sampleProducts,
  sampleCustomers,
  sampleQuotations,
  sampleOrders,
  sampleStockMovements,
  initialSettings,
} from '../data/sampleData';
import { normalizeSearch } from '../utils/formatters';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  duration?: number;
}

interface AppContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  deviceViewMode: 'mobile' | 'responsive';
  setDeviceViewMode: (mode: 'mobile' | 'responsive') => void;

  // Data
  products: Product[];
  customers: Customer[];
  quotations: Quotation[];
  orders: Order[];
  stockMovements: StockMovement[];
  settings: ShopSettings;

  // Toast / Notifications
  toast: ToastState | null;
  showToast: (message: string, undoAction?: () => void, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  checkDuplicateProduct: (name: string, excludeId?: string) => Product | undefined;

  // Stock Actions
  adjustStock: (
    productId: string,
    quantityDelta: number,
    reason: StockMovementReason,
    options?: {
      supplier?: string;
      purchasePrice?: number;
      referenceNumber?: string;
      notes?: string;
      orderId?: string;
      user?: string;
    }
  ) => { success: boolean; previousStock: number; newStock: number; movementId: string };
  undoStockMovement: (movementId: string) => boolean;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  archiveCustomer: (id: string) => void;
  setCustomerPrice: (customerId: string, productId: string, price: number) => void;

  // Quotation Actions
  createQuotation: (quoteData: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>) => Quotation;
  updateQuotationStatus: (id: string, status: QuoteStatus) => void;
  convertQuoteToOrder: (quoteId: string) => { success: boolean; order?: Order; error?: string };
  getNextQuoteNumber: () => string;

  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, returnInventoryOnCancel?: boolean) => void;
  updateOrderFulfillment: (orderId: string, fulfilledItems: Record<string, number>) => void;
  getNextOrderNumber: () => string;

  // Settings & Storage
  updateSettings: (updates: Partial<ShopSettings>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportDataJson: () => string;
}

const STORAGE_KEYS = {
  PRODUCTS: 'kf_products_v1',
  CUSTOMERS: 'kf_customers_v1',
  QUOTES: 'kf_quotes_v1',
  ORDERS: 'kf_orders_v1',
  STOCK: 'kf_stock_v1',
  SETTINGS: 'kf_settings_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [deviceViewMode, setDeviceViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Initialize from LocalStorage or seed with realistic sample data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : sampleProducts;
    } catch {
      return sampleProducts;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : sampleCustomers;
    } catch {
      return sampleCustomers;
    }
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : sampleQuotations;
    } catch {
      return sampleQuotations;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : sampleOrders;
    } catch {
      return sampleOrders;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK);
      return saved ? JSON.parse(saved) : sampleStockMovements;
    } catch {
      return sampleStockMovements;
    }
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Toast Helper
  const showToast = useCallback(
    (
      message: string,
      undoAction?: () => void,
      type: 'success' | 'info' | 'warning' | 'error' = 'success'
    ) => {
      const id = Date.now().toString();
      setToast({ id, message, undoAction, type });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, undoAction ? 6000 : 3500);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Product Actions
  const checkDuplicateProduct = useCallback(
    (name: string, excludeId?: string): Product | undefined => {
      const norm = normalizeSearch(name);
      return products.find(
        (p) =>
          !p.isArchived &&
          p.id !== excludeId &&
          (normalizeSearch(p.name) === norm ||
            (norm.length > 5 && normalizeSearch(p.name).includes(norm)) ||
            (norm.length > 5 && norm.includes(normalizeSearch(p.name))))
      );
    },
    [products]
  );

  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);

      // If initial stock was entered > 0, log a stock movement
      if (newProduct.currentStock > 0) {
        const movement: StockMovement = {
          id: `mov-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          quantityDelta: newProduct.currentStock,
          previousStock: 0,
          newStock: newProduct.currentStock,
          unit: newProduct.unit,
          reason: 'Manual stock in',
          date: new Date().toISOString(),
          user: settings.ownerName || 'Owner',
          notes: 'Initial stock recorded on product creation',
        };
        setStockMovements((prev) => [movement, ...prev]);
      }

      showToast(`Product "${newProduct.name}" added successfully!`);
      return newProduct;
    },
    [settings.ownerName, showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
      );
      showToast('Product updated successfully.');
    },
    [showToast]
  );

  const archiveProduct = useCallback(
    (id: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isArchived: true, updatedAt: new Date().toISOString() } : p))
      );
      showToast('Product deactivated and archived. Historical records remain intact.');
    },
    [showToast]
  );

  // Stock Actions
  const adjustStock = useCallback(
    (
      productId: string,
      quantityDelta: number,
      reason: StockMovementReason,
      options?: {
        supplier?: string;
        purchasePrice?: number;
        referenceNumber?: string;
        notes?: string;
        orderId?: string;
        user?: string;
      }
    ) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return { success: false, previousStock: 0, newStock: 0, movementId: '' };

      const previousStock = prod.currentStock;
      const newStock = Math.round((previousStock + quantityDelta) * 100) / 100;
      const movementId = `mov-${Date.now()}`;

      // Update product stock
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, currentStock: newStock } : p))
      );

      // Record movement
      const movement: StockMovement = {
        id: movementId,
        productId,
        productName: prod.name,
        quantityDelta,
        previousStock,
        newStock,
        unit: prod.unit,
        reason,
        supplier: options?.supplier,
        purchasePrice: options?.purchasePrice,
        referenceNumber: options?.referenceNumber,
        notes: options?.notes,
        orderId: options?.orderId,
        date: new Date().toISOString(),
        user: options?.user || settings.ownerName || 'Owner',
      };

      setStockMovements((prev) => [movement, ...prev]);

      // Provide Undo capability
      const undoAction = () => {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, currentStock: previousStock } : p))
        );
        const undoMovement: StockMovement = {
          id: `mov-${Date.now()}`,
          productId,
          productName: prod.name,
          quantityDelta: -quantityDelta,
          previousStock: newStock,
          newStock: previousStock,
          unit: prod.unit,
          reason: 'Adjustment',
          notes: `Undo of movement #${movementId}`,
          date: new Date().toISOString(),
          user: settings.ownerName || 'Owner',
        };
        setStockMovements((prev) => [undoMovement, ...prev]);
        showToast('Stock change undone successfully.');
      };

      const directionText = quantityDelta > 0 ? 'added to' : 'removed from';
      const absDelta = Math.abs(quantityDelta);
      showToast(
        `Successfully ${directionText} stock: ${absDelta} ${prod.unit} (${prod.name}).`,
        undoAction
      );

      return { success: true, previousStock, newStock, movementId };
    },
    [products, settings.ownerName, showToast]
  );

  const undoStockMovement = useCallback(
    (movementId: string): boolean => {
      const mov = stockMovements.find((m) => m.id === movementId);
      if (!mov) return false;

      const prod = products.find((p) => p.id === mov.productId);
      if (!prod) return false;

      const previousStock = prod.currentStock;
      const reversedStock = Math.round((previousStock - mov.quantityDelta) * 100) / 100;

      setProducts((prev) =>
        prev.map((p) => (p.id === mov.productId ? { ...p, currentStock: reversedStock } : p))
      );

      const undoMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: mov.productId,
        productName: mov.productName,
        quantityDelta: -mov.quantityDelta,
        previousStock,
        newStock: reversedStock,
        unit: mov.unit,
        reason: 'Adjustment',
        notes: `Undo of movement #${movementId}`,
        date: new Date().toISOString(),
        user: settings.ownerName || 'Owner',
      };

      setStockMovements((prev) => [undoMovement, ...prev]);
      showToast(`Reversed stock change for ${mov.productName}.`);
      return true;
    },
    [stockMovements, products, settings.ownerName, showToast]
  );

  // Customer Actions
  const addCustomer = useCallback(
    (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
      const newCustomer: Customer = {
        ...customerData,
        id: `cust-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      showToast(`Customer "${newCustomer.businessName || newCustomer.name}" added!`);
      return newCustomer;
    },
    [showToast]
  );

  const updateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      showToast('Customer profile updated.');
    },
    [showToast]
  );

  const archiveCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c)));
      showToast('Customer archived.');
    },
    [showToast]
  );

  const setCustomerPrice = useCallback(
    (customerId: string, productId: string, price: number) => {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== customerId) return c;
          const updatedPrices = { ...c.customerPrices };
          if (price <= 0) {
            delete updatedPrices[productId];
          } else {
            updatedPrices[productId] = price;
          }
          return { ...c, customerPrices: updatedPrices };
        })
      );
      showToast('Special wholesale rate saved for this customer.');
    },
    [showToast]
  );

  // Quotation Actions
  const getNextQuoteNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const existingNumbers = quotations
      .map((q) => {
        const match = q.quoteNumber.match(/QT-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 15;
    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `QT-${year}-${nextNum}`;
  }, [quotations]);

  const createQuotation = useCallback(
    (quoteData: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>): Quotation => {
      const quoteNumber = getNextQuoteNumber();
      const newQuote: Quotation = {
        ...quoteData,
        id: `quote-${Date.now()}`,
        quoteNumber,
        createdAt: new Date().toISOString(),
      };
      setQuotations((prev) => [newQuote, ...prev]);
      showToast(`Quotation ${quoteNumber} created!`);
      return newQuote;
    },
    [getNextQuoteNumber, showToast]
  );

  const updateQuotationStatus = useCallback(
    (id: string, status: QuoteStatus) => {
      setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      showToast(`Quotation status changed to "${status.toUpperCase()}".`);
    },
    [showToast]
  );

  // Order Actions
  const getNextOrderNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const existingNumbers = orders
      .map((o) => {
        const match = o.orderNumber.match(/ORD-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 2;
    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `ORD-${year}-${nextNum}`;
  }, [orders]);

  const createOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
      const orderNumber = getNextOrderNumber();
      const shouldDeductStock =
        settings.inventoryDeductTrigger === 'on_create' ||
        (settings.inventoryDeductTrigger === 'on_confirm' && orderData.status === 'confirmed');

      const newOrder: Order = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber,
        stockDeducted: shouldDeductStock,
        stockDeductedAt: shouldDeductStock ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Deduct stock if trigger matches
      if (shouldDeductStock) {
        newOrder.items.forEach((item) => {
          adjustStock(item.productId, -item.quantity, 'Order fulfillment', {
            orderId: newOrder.id,
            notes: `Auto-deducted on order ${newOrder.orderNumber}`,
          });
        });
      }

      showToast(`Order ${orderNumber} created!`);
      return newOrder;
    },
    [getNextOrderNumber, settings.inventoryDeductTrigger, adjustStock, showToast]
  );

  const convertQuoteToOrder = useCallback(
    (quoteId: string): { success: boolean; order?: Order; error?: string } => {
      const quote = quotations.find((q) => q.id === quoteId);
      if (!quote) return { success: false, error: 'Quotation not found' };

      // Rule: Prevent duplicate conversion
      if (quote.convertedOrderId || quote.status === 'converted') {
        return {
          success: false,
          error: 'This quotation has already been converted into an order.',
        };
      }

      const orderNumber = getNextOrderNumber();
      const shouldDeduct = settings.inventoryDeductTrigger === 'on_confirm'; // default confirmed

      const orderItems = quote.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        fulfilledQuantity: item.quantity,
        pendingQuantity: 0,
        total: item.total,
      }));

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        quotationId: quote.id,
        quotationNumber: quote.quoteNumber,
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerBusiness: quote.customerBusiness,
        customerPhone: quote.customerPhone,
        customerAddress: quote.customerAddress,
        items: orderItems,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        grandTotal: quote.grandTotal,
        notes: quote.notes ? `Converted from ${quote.quoteNumber}. ${quote.notes}` : `Converted from ${quote.quoteNumber}`,
        status: 'confirmed',
        stockDeducted: shouldDeduct,
        stockDeductedAt: shouldDeduct ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Mark quote as converted
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quoteId ? { ...q, status: 'converted', convertedOrderId: newOrder.id } : q
        )
      );

      // Deduct stock if configured
      if (shouldDeduct) {
        quote.items.forEach((item) => {
          adjustStock(item.productId, -item.quantity, 'Order fulfillment', {
            orderId: newOrder.id,
            notes: `Deducted for converted order ${orderNumber}`,
          });
        });
      }

      showToast(`Quotation ${quote.quoteNumber} converted to Order ${orderNumber}!`);
      return { success: true, order: newOrder };
    },
    [quotations, getNextOrderNumber, settings.inventoryDeductTrigger, adjustStock, showToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus, returnInventoryOnCancel?: boolean) => {
      const ord = orders.find((o) => o.id === orderId);
      if (!ord) return;

      let stockDeducted = ord.stockDeducted;
      let stockDeductedAt = ord.stockDeductedAt;

      // Handle stock deduction on status change if not yet deducted
      if (
        !stockDeducted &&
        ((settings.inventoryDeductTrigger === 'on_confirm' &&
          ['confirmed', 'preparing', 'ready', 'delivered'].includes(newStatus)) ||
          (settings.inventoryDeductTrigger === 'on_deliver' && newStatus === 'delivered'))
      ) {
        stockDeducted = true;
        stockDeductedAt = new Date().toISOString();
        ord.items.forEach((item) => {
          adjustStock(item.productId, -item.quantity, 'Order fulfillment', {
            orderId: ord.id,
            notes: `Deducted when order moved to ${newStatus}`,
          });
        });
      }

      // Handle cancellation & returning inventory
      if (newStatus === 'cancelled' && ord.stockDeducted && returnInventoryOnCancel) {
        ord.items.forEach((item) => {
          adjustStock(item.productId, item.quantity, 'Order cancellation return', {
            orderId: ord.id,
            notes: `Restocked after cancellation of ${ord.orderNumber}`,
          });
        });
        stockDeducted = false;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, stockDeducted, stockDeductedAt, updatedAt: new Date().toISOString() }
            : o
        )
      );

      showToast(`Order ${ord.orderNumber} status changed to "${newStatus.toUpperCase()}".`);
    },
    [orders, settings.inventoryDeductTrigger, adjustStock, showToast]
  );

  const updateOrderFulfillment = useCallback(
    (orderId: string, fulfilledMap: Record<string, number>) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          const updatedItems = ord.items.map((item) => {
            const fulfilled = fulfilledMap[item.productId] ?? item.fulfilledQuantity;
            const pending = Math.max(0, item.quantity - fulfilled);
            return {
              ...item,
              fulfilledQuantity: fulfilled,
              pendingQuantity: pending,
            };
          });
          return { ...ord, items: updatedItems, updatedAt: new Date().toISOString() };
        })
      );
      showToast('Order fulfillment progress updated.');
    },
    [showToast]
  );

  // Settings & Storage Management
  const updateSettings = useCallback(
    (updates: Partial<ShopSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast('Settings saved.');
    },
    [showToast]
  );

  const resetToDemoData = useCallback(() => {
    setProducts(sampleProducts);
    setCustomers(sampleCustomers);
    setQuotations(sampleQuotations);
    setOrders(sampleOrders);
    setStockMovements(sampleStockMovements);
    setSettings(initialSettings);
    showToast('Reset to realistic Indian grocery demo data successfully!');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    setProducts([]);
    setCustomers([]);
    setQuotations([]);
    setOrders([]);
    setStockMovements([]);
    setSettings({ ...initialSettings, isOnboarded: false });
    showToast('All data cleared.');
  }, [showToast]);

  const exportDataJson = useCallback((): string => {
    const data = {
      exportDate: new Date().toISOString(),
      shop: settings,
      products,
      customers,
      quotations,
      orders,
      stockMovements,
    };
    return JSON.stringify(data, null, 2);
  }, [settings, products, customers, quotations, orders, stockMovements]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        deviceViewMode,
        setDeviceViewMode,
        products,
        customers,
        quotations,
        orders,
        stockMovements,
        settings,
        toast,
        showToast,
        hideToast,
        addProduct,
        updateProduct,
        archiveProduct,
        checkDuplicateProduct,
        adjustStock,
        undoStockMovement,
        addCustomer,
        updateCustomer,
        archiveCustomer,
        setCustomerPrice,
        createQuotation,
        updateQuotationStatus,
        convertQuoteToOrder,
        getNextQuoteNumber,
        createOrder,
        updateOrderStatus,
        updateOrderFulfillment,
        getNextOrderNumber,
        updateSettings,
        resetToDemoData,
        clearAllData,
        exportDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
