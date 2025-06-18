import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers/ManageUsers';
import IdVerification from './pages/verification/IdVerification';
import FacialVerification from './pages/verification/FacialVerification';
import AddressVerification from './pages/verification/AddressVerification';
import Messaging from './pages/Messaging';
import Browsinghistory from './pages/BrowsingHistory';
import NftSetting from './pages/nfttrading/NftSettings';
import NftStore from './pages/nfttrading/NftStore';
import ActiveTrades from './pages/trades/ActiveTrades';
import TradeSettings from './pages/trades/TradeSettings';
import CardSettings from './pages/cards/CardsSettings';
import PurchasedCards from './pages/cards/PurchasedCard'
import AccountsPackage from './pages/AccountPackage/AccountPackage';
import PopupForm from './pages/popup/PopupForm';
import PopupInvoice from './pages/popup/PopupInvoice';
import PopupMessages from './pages/popup/PopupMessages';
import Deposit from './pages/transactions/Deposit';
import Withdrawal from './pages/transactions/Withdrawal';
import UpgradeInvoice from './pages/transactions/UpgradeInvoice';
import OtherInvoice from './pages/transactions/OtherInvoice';
import BotInvoice from './pages/transactions/BotInvoice';
import CardInvoice from './pages/transactions/CardInvoice';
import SignalInvoice from './pages/transactions/SignalInvoice';
import AssignmentsPopup from './pages/assignments/AssignmentsPopup';
import AssignmentsForms from './pages/assignments/AssignmentsForms';
import AssignmentsInvoice from './pages/assignments/AssignmentsInvoice';
import WithdrawalToken from './pages/WithdrawalToken';
import Support from './pages/Support/Support';
import LoginPage from './auth/LoginPage';

import DepositSettings from './pages/settings/DepositSettings';
import CurrenciesSettings from './pages/settings/CurrenciesSettings';
import SiteSettings from './pages/settings/SiteSettings/SiteSettings';
import WithdrawalSettings from './pages/settings/WithdrawalSettings';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageNotFound from './components/PageNotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public route - accessible without authentication */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        {/* All protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          
          {/* Settings routes */}
          <Route path="settings">
            <Route index element={<DepositSettings />} />
            <Route path="depositsettings" element={<DepositSettings />} />
            <Route path="currency" element={<CurrenciesSettings />} />
            <Route path="sitesettings" element={<SiteSettings />} />
            <Route path="withdrawalsettings" element={<WithdrawalSettings />} />
          </Route>

          {/* Verification routes */}
          <Route path="verification">
            <Route index element={<IdVerification />} />
            <Route path="id" element={<IdVerification />} />
            <Route path="facial" element={<FacialVerification />} />
            <Route path="address" element={<AddressVerification />} />
          </Route>
            
          <Route path="messaging" element={<Messaging />} />
          <Route path="browsinghistory" element={<Browsinghistory />} />
          
          <Route path="nfttrading">
            <Route index element={<NftStore />} />
            <Route path="nftStores" element={<NftStore />} />
            <Route path="nftSettings" element={<NftSetting />} />
          </Route>

          {/* Trades routes */}
          <Route path="trades">
            <Route index element={<ActiveTrades />} />
            <Route path="active" element={<ActiveTrades />} />
            <Route path="settings" element={<TradeSettings />} />
          </Route>

          {/* Cards routes */}
          <Route path="cards">
            <Route index element={<CardSettings />} />
            <Route path="cardssettings" element={<CardSettings />} />
            <Route path="purchasedcards" element={<PurchasedCards />} />
          </Route>
          
          <Route path="accounts-package" element={<AccountsPackage />} />
          
          {/* Popup routes */}
          <Route path="popup">
            <Route index element={<PopupForm />} />
            <Route path="form" element={<PopupForm />} />
            <Route path="invoice" element={<PopupInvoice />} />
            <Route path="messages" element={<PopupMessages />} />
          </Route>
          
          {/* Transactions routes */}
          <Route path="transactions">
            <Route index element={<Deposit />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdrawal" element={<Withdrawal />} />
            <Route path="upgrade-invoice" element={<UpgradeInvoice />} />
            <Route path="other-invoice" element={<OtherInvoice />} />
            <Route path="bot-invoice" element={<BotInvoice />} />
            <Route path="signal-invoice" element={<SignalInvoice />} />
            <Route path="card-invoice" element={<CardInvoice />} />
          </Route>
          
          {/* Assignments routes */}
          <Route path="assignments">
            <Route index element={<AssignmentsPopup />} />
            <Route path="popup" element={<AssignmentsPopup />} />
            <Route path="forms" element={<AssignmentsForms />} />
            <Route 
              path="invoice" 
              element={
                <ErrorBoundary>
                  <AssignmentsInvoice />
                </ErrorBoundary>
              } 
            />
          </Route>
          
          <Route path="withdrawal-token" element={<WithdrawalToken />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;