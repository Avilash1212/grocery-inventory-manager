import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Product, Customer, Quotation, Order } from './types';
import { Header } from './components/navigation/Header';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { UndoToast } from './components/common/UndoToast';

// Views
import { HomeDashboard } from './components/home/HomeDashboard';
import { ProductsView } from './components/products/ProductsView';
import { CustomersView } from './components/customers/CustomersView';
import { QuotesView } from './components/quotes/QuotesView';
import { OrdersView } from './components/orders/OrdersView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { StockInModal } from './components/stock/StockInModal';
import { StockOutModal } from './components/stock/StockOutModal';
import { StockHistoryModal } from './components/stock/StockHistoryModal';
import { AddEditProductModal } from './components/products/AddEditProductModal';
import { AddEditCustomerModal } from './components/customers/AddEditCustomerModal';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal';
import { QuotationBuilderModal } from './components/quotes/QuotationBuilderModal';
import { QuotationDetailModal } from './components/quotes/QuotationDetailModal';
import { WhatsAppShareModal } from './components/quotes/WhatsAppShareModal';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

export const MainApp: React.FC = () => {
  const { activeTab, setActiveTab, deviceViewMode, settings } = useApp();

  // Modal States
  const [stockInProduct, setStockInProduct] = useState<Product | undefined>(undefined);
  const [isStockInOpen, setIsStockInOpen] = useState(false);

  const [stockOutProduct, setStockOutProduct] = useState<Product | undefined>(undefined);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);

  const [historyProductId, setHistoryProductId] = useState<string | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [activeCustomerDetail, setActiveCustomerDetail] = useState<Customer | null>(null);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);

  const [quoteCustomer, setQuoteCustomer] = useState<Customer | null>(null);
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isQuoteDetailOpen, setIsQuoteDetailOpen] = useState(false);

  const [whatsappQuotation, setWhatsappQuotation] = useState<Quotation | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!settings.isOnboarded);

  // Handlers
  const handleOpenStockIn = (product?: Product) => {
    setStockInProduct(product);
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (product?: Product) => {
    setStockOutProduct(product);
    setIsStockOutOpen(true);
  };

  const handleOpenHistory = (productId?: string) => {
    setHistoryProductId(productId);
    setIsHistoryOpen(true);
  };

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setCustomerToEdit(cust);
    setIsCustomerModalOpen(true);
  };

  const handleOpenCustomerDetail = (cust: Customer) => {
    setActiveCustomerDetail(cust);
    setIsCustomerDetailOpen(true);
  };

  const handleOpenCreateQuote = (cust?: Customer | null) => {
    setQuoteCustomer(cust || null);
    setIsCreateQuoteOpen(true);
  };

  const handleOpenQuoteDetail = (quote: Quotation) => {
    setSelectedQuotation(quote);
    setIsQuoteDetailOpen(true);
  };

  const handleOpenWhatsAppShare = (quote: Quotation) => {
    setWhatsappQuotation(quote);
    setIsWhatsAppOpen(true);
  };

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleOnboardingAction = (action: 'product' | 'customer' | 'quote') => {
    if (action === 'product') {
      setActiveTab('products');
      handleOpenAddProduct();
    } else if (action === 'customer') {
      setActiveTab('customers');
      handleOpenAddCustomer();
    } else if (action === 'quote') {
      setActiveTab('quotes');
      handleOpenCreateQuote();
    }
  };

  return (
    <div
      className={`min-h-screen ${
        deviceViewMode === 'mobile'
          ? 'bg-slate-900 md:py-6 flex items-center justify-center'
          : 'bg-slate-50'
      }`}
    >
      {/* Smartphone Device Frame Wrapper (when in mobile preview mode on desktop) */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceViewMode === 'mobile'
            ? 'max-w-[430px] min-h-[100dvh] md:min-h-[850px] md:max-h-[920px] bg-slate-50 md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative'
            : 'max-w-4xl mx-auto min-h-screen bg-slate-50 flex flex-col'
        }`}
      >
        {/* Mobile Device Speaker Notch (Desktop frame only) */}
        {deviceViewMode === 'mobile' && (
          <div className="hidden md:flex justify-center items-center h-4 w-full bg-slate-800 shrink-0">
            <div className="w-16 h-1 bg-slate-700 rounded-full" />
          </div>
        )}

        {/* Global Header */}
        <Header />

        {/* Tab Viewport Body */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-4 overscroll-contain">
          {activeTab === 'home' && (
            <HomeDashboard
              onOpenStockIn={handleOpenStockIn}
              onOpenStockOut={handleOpenStockOut}
              onOpenCreateQuote={() => handleOpenCreateQuote(null)}
              onOpenAddCustomer={handleOpenAddCustomer}
              onViewQuotation={handleOpenQuoteDetail}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              onOpenAddProduct={handleOpenAddProduct}
              onOpenEditProduct={handleOpenEditProduct}
              onOpenStockIn={handleOpenStockIn}
              onOpenStockOut={handleOpenStockOut}
              onOpenHistory={handleOpenHistory}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              onOpenAddCustomer={handleOpenAddCustomer}
              onOpenCustomerDetail={handleOpenCustomerDetail}
              onCreateQuoteForCustomer={(cust) => handleOpenCreateQuote(cust)}
            />
          )}

          {activeTab === 'quotes' && (
            <QuotesView
              onOpenCreateQuote={() => handleOpenCreateQuote(null)}
              onOpenQuoteDetail={handleOpenQuoteDetail}
              onOpenWhatsAppShare={handleOpenWhatsAppShare}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView onOpenOrderDetail={handleOpenOrderDetail} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav />

        {/* Undo Toast Container */}
        <UndoToast />
      </div>

      {/* Global Modals */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        preselectedProduct={stockInProduct}
      />

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        preselectedProduct={stockOutProduct}
      />

      <StockHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        filterProductId={historyProductId}
      />

      <AddEditProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <AddEditCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <CustomerDetailModal
        isOpen={isCustomerDetailOpen}
        onClose={() => setIsCustomerDetailOpen(false)}
        customer={activeCustomerDetail}
        onEditCustomer={handleOpenEditCustomer}
        onCreateQuoteForCustomer={(cust) => handleOpenCreateQuote(cust)}
      />

      <QuotationBuilderModal
        isOpen={isCreateQuoteOpen}
        onClose={() => setIsCreateQuoteOpen(false)}
        preselectedCustomer={quoteCustomer}
        onQuotationCreated={(quote) => handleOpenQuoteDetail(quote)}
      />

      <QuotationDetailModal
        isOpen={isQuoteDetailOpen}
        onClose={() => setIsQuoteDetailOpen(false)}
        quotation={selectedQuotation}
        onOpenWhatsAppShare={handleOpenWhatsAppShare}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        quotation={whatsappQuotation}
        settings={settings}
      />

      <OrderDetailModal
        isOpen={isOrderDetailOpen}
        onClose={() => setIsOrderDetailOpen(false)}
        order={selectedOrder}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectAction={handleOnboardingAction}
      />
    </div>
  );
};

export default function App() {
  return <MainApp />;
}
