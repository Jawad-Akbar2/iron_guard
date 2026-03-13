import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import { useUIStore } from './store/uiStore.js';
import { useEffect } from 'react';

// Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { AccountsPage } from './pages/AccountsPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { TransactionsPage } from './pages/TransactionsPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { PaymentsPage } from './pages/PaymentsPage.jsx';
import { ReturnsPage } from './pages/ReturnsPage.jsx';
import { SettingsUsersPage } from './pages/SettingsUsersPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

// Components
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { NotificationCenter } from './components/NotificationCenter.jsx';

// Modals
import { AddEditCustomerModal } from './components/modals/AddEditCustomerModal.jsx';
import { AddEditSupplierModal } from './components/modals/AddEditSupplierModal.jsx';
import { AccountLedgerModal } from './components/modals/AccountLedgerModal.jsx';
import { AddTransactionModal } from './components/modals/AddTransactionModal.jsx';
import { AddPaymentModal } from './components/modals/AddPaymentModal.jsx';
import { AddReturnModal } from './components/modals/AddReturnModal.jsx';
import { EditTransactionModal } from './components/modals/EditTransactionModal.jsx';
import { TransactionReceiptModal } from './components/modals/TransactionReceiptModal.jsx';
import { AddEditItemModal } from './components/modals/AddEditItemModal.jsx';
import { AddEditUserModal } from './components/modals/AddEditUserModal.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const ModalManager = () => {
  const modals = useUIStore((state) => state.modals);
  const { closeModal } = useUIStore();

  return (
    <>
      {/* Customer Modals */}
      {modals['addCustomer']?.open && (
        <AddEditCustomerModal 
          modalName="addCustomer" 
          data={null}
          onSuccess={() => closeModal('addCustomer')}
        />
      )}
      {modals['editCustomer']?.open && (
        <AddEditCustomerModal 
          modalName="editCustomer" 
          data={modals['editCustomer']?.data}
          onSuccess={() => closeModal('editCustomer')}
        />
      )}

      {/* Supplier Modals */}
      {modals['addSupplier']?.open && (
        <AddEditSupplierModal 
          modalName="addSupplier" 
          data={null}
          onSuccess={() => closeModal('addSupplier')}
        />
      )}
      {modals['editSupplier']?.open && (
        <AddEditSupplierModal 
          modalName="editSupplier" 
          data={modals['editSupplier']?.data}
          onSuccess={() => closeModal('editSupplier')}
        />
      )}

      {/* Account Ledger Modal */}
      {modals['accountLedger']?.open && (
        <AccountLedgerModal data={modals['accountLedger']?.data} />
      )}

      {/* Item Modals */}
      {modals['addItem']?.open && (
        <AddEditItemModal 
          modalName="addItem" 
          data={null}
          onSuccess={() => closeModal('addItem')}
        />
      )}
      {modals['editItem']?.open && (
        <AddEditItemModal 
          modalName="editItem" 
          data={modals['editItem']?.data}
          onSuccess={() => closeModal('editItem')}
        />
      )}

      {/* Transaction Modals */}
      {modals['transactionReceipt']?.open && (
        <TransactionReceiptModal data={modals['transactionReceipt']?.data} />
      )}
      {modals['addTransaction']?.open && (
        <AddTransactionModal 
          modalName="addTransaction" 
          onSuccess={() => closeModal('addTransaction')}
        />
      )}
      {modals['editTransaction']?.open && (
        <EditTransactionModal 
          modalName="editTransaction"
          data={modals['editTransaction']?.data}
          onSuccess={() => closeModal('editTransaction')}
        />
      )}

      {/* Payment Modal */}
      {modals['addPayment']?.open && (
        <AddPaymentModal 
          modalName="addPayment"
          onSuccess={() => closeModal('addPayment')}
        />
      )}

      {/* Return Modal */}
      {modals['addReturn']?.open && (
        <AddReturnModal 
          modalName="addReturn"
          onSuccess={() => closeModal('addReturn')}
        />
      )}

      {/* User Modals */}
      {modals['addUser']?.open && (
        <AddEditUserModal 
          modalName="addUser" 
          data={null}
          onSuccess={() => closeModal('addUser')}
        />
      )}
      {modals['editUser']?.open && (
        <AddEditUserModal 
          modalName="editUser" 
          data={modals['editUser']?.data}
          onSuccess={() => closeModal('editUser')}
        />
      )}
    </>
  );
};

function App() {
  const { token, getMe } = useAuthStore();

  useEffect(() => {
    if (token) {
      getMe().catch(() => {
        // Token invalid
      });
    }
  }, [token, getMe]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Toaster position="top-right" />
          <NotificationCenter />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AccountsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TransactionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PaymentsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/returns"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReturnsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings/users"
              element={
                <ProtectedRoute requiredRole="Owner">
                  <Layout>
                    <SettingsUsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <ModalManager />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;