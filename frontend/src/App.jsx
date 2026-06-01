import { useMemo, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "customers", label: "Customers" },
  { key: "orders", label: "Orders" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshToken, setRefreshToken] = useState(0);

  const triggerRefresh = () => setRefreshToken((value) => value + 1);

  const content = useMemo(() => {
    if (activeTab === "dashboard") {
      return <DashboardPage refreshToken={refreshToken} />;
    }

    if (activeTab === "products") {
      return <ProductsPage onDataChanged={triggerRefresh} />;
    }

    if (activeTab === "customers") {
      return <CustomersPage onDataChanged={triggerRefresh} />;
    }

    return <OrdersPage onDataChanged={triggerRefresh} />;
  }, [activeTab, refreshToken]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory Intelligence</p>
          <h1>Inventory & Order Management System</h1>
        </div>
      </header>

      <nav className="tab-row" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="page-wrapper">{content}</main>
    </div>
  );
}
