import { Routes, Route } from 'react-router-dom';
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
import PurchasedCards from './pages/cards/PurchasedCard';
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

import MiningOverview from './pages/mining/MiningOverview';
import MiningPools from './pages/mining/MiningPools';
import MiningEquipment from './pages/mining/MiningEquipment';
import MiningSessions from './pages/mining/MiningSessions';
import MiningRewards from './pages/mining/MiningRewards';
import MiningBoosters from './pages/mining/MiningBoosters';
import MiningAnalytics from './pages/mining/MiningAnalytics';
import MiningUserStats from './pages/mining/MiningUserStats';

import DepositSettings from './pages/settings/DepositSettings';
import CurrenciesSettings from './pages/settings/CurrenciesSettings';
import SiteSettings from './pages/settings/SiteSettings/SiteSettings';
import WithdrawalSettings from './pages/settings/WithdrawalSettings';
import TradingMode from './pages/settings/TradingMode';

// Copy Trading imports
import Copytrading from './pages/copytrading/Copytrading';
import CopiedTrades from './pages/copytrading/CopiedTrades';
import TraderTrades from './pages/copytrading/TraderTrades';
// import CopyTradingAnalytics from './pages/copytrading/CopyTradingAnalytics'; // Comment out for now

import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageNotFound from './components/PageNotFound';
import ProtectedRoute from './components/ProtectedRoute';

import SignalPackage from './pages/SignalPackage/SignalPackage';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />

          {/* Settings */}
          <Route path="settings">
            <Route index element={<DepositSettings />} />
            <Route path="depositsettings" element={<DepositSettings />} />
            <Route path="currency" element={<CurrenciesSettings />} />
            <Route path="sitesettings" element={<SiteSettings />} />
            <Route path="withdrawalsettings" element={<WithdrawalSettings />} />
            <Route path="trading-mode" element={<TradingMode />} />
          </Route>

          {/* Copy Trading */}
          <Route path="copy-trading">
            <Route index element={<Copytrading />} />
            <Route path="traders" element={<Copytrading />} />
            <Route path="copied-trades" element={<CopiedTrades />} />
             <Route path="trader/:traderId/trades" element={<TraderTrades />} />
            {/* <Route path="analytics" element={<CopyTradingAnalytics />} /> */}
          </Route>

          <Route path="mining">
            <Route index element={<MiningOverview />} />
            <Route path="overview" element={<MiningOverview />} />
            <Route path="pools" element={<MiningPools />} />
            <Route path="equipment" element={<MiningEquipment />} />
            <Route path="sessions" element={<MiningSessions />} />
            <Route path="rewards" element={<MiningRewards />} />
            <Route path="boosters" element={<MiningBoosters />} />
            <Route path="analytics" element={<MiningAnalytics />} />
            <Route path="user-stats" element={<MiningUserStats />} />
          </Route>

          {/* Verification */}
          <Route path="verification">
            <Route index element={<IdVerification />} />
            <Route path="id" element={<IdVerification />} />
            <Route path="facial" element={<FacialVerification />} />
            <Route path="address" element={<AddressVerification />} />
          </Route>

          {/* Other routes */}
          <Route path="messaging" element={<Messaging />} />
          <Route path="browsinghistory" element={<Browsinghistory />} />

          <Route path="nfttrading">
            <Route index element={<NftStore />} />
            <Route path="nftStores" element={<NftStore />} />
            <Route path="nftSettings" element={<NftSetting />} />
          </Route>

          <Route path="trades">
            <Route index element={<ActiveTrades />} />
            <Route path="active" element={<ActiveTrades />} />
            <Route path="settings" element={<TradeSettings />} />
          </Route>

          <Route path="cards">
            <Route index element={<CardSettings />} />
            <Route path="cardssettings" element={<CardSettings />} />
            <Route path="purchasedcards" element={<PurchasedCards />} />
          </Route>

          <Route path="accounts-package" element={<AccountsPackage />} />
          <Route path="signal-packages" element={<SignalPackage />} />

          <Route path="popup">
            <Route index element={<PopupForm />} />
            <Route path="form" element={<PopupForm />} />
            <Route path="invoice" element={<PopupInvoice />} />
            <Route path="messages" element={<PopupMessages />} />
          </Route>

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

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;