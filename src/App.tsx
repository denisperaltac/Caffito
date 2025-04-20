import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import InventoryPage from "./pages/inventory/InventoryPage";
import StockManagementPage from "./pages/inventory/StockManagementPage";
import StockMovementPage from "./pages/inventory/StockMovementPage";
import LabelsPage from "./pages/inventory/LabelsPage";
import SuppliersPage from "./pages/inventory/SuppliersPage";
import CategoriesPage from "./pages/inventory/CategoriesPage";
import BrandsPage from "./pages/inventory/BrandsPage";
import TaxesPage from "./pages/inventory/TaxesPage";
import ProductsPage from "./pages/inventory/ProductsPage";
import CashPage from "./pages/cash/CashPage";
import ConfigurationPage from "./pages/configuration/ConfigurationPage";
import PointsOfSalePage from "./pages/configuration/PointsOfSalePage";
import PromotionsPage from "./pages/configuration/PromotionsPage";
import PointOfSalePage from "./pages/pointOfSale/PointOfSalePage";
import LoginPage from "./pages/auth/LoginPage";
import { authService } from "./services/authService";
import CashierClosuresPage from "./pages/cash/CashierClosuresPage";
import ClientsPage from "./pages/clients/ClientsPage";

// Componente para proteger rutas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return authService.isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main>
          <div className="max-w-full mx-auto py-6 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="px-4 sm:px-0">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <InventoryPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/inventario"
                  element={
                    <PrivateRoute>
                      <InventoryPage />
                    </PrivateRoute>
                  }
                >
                  <Route
                    path="gestion-stock"
                    element={
                      <PrivateRoute>
                        <StockManagementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="movimiento-stock"
                    element={
                      <PrivateRoute>
                        <StockMovementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="productos"
                    element={
                      <PrivateRoute>
                        <ProductsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="etiquetas"
                    element={
                      <PrivateRoute>
                        <LabelsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="proveedor"
                    element={
                      <PrivateRoute>
                        <SuppliersPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="categorias"
                    element={
                      <PrivateRoute>
                        <CategoriesPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="marcas"
                    element={
                      <PrivateRoute>
                        <BrandsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="impuesto"
                    element={
                      <PrivateRoute>
                        <TaxesPage />
                      </PrivateRoute>
                    }
                  />
                </Route>
                <Route
                  path="/caja"
                  element={
                    <PrivateRoute>
                      <CashPage />
                    </PrivateRoute>
                  }
                >
                  <Route
                    path="cierres"
                    element={
                      <PrivateRoute>
                        <CashierClosuresPage />
                      </PrivateRoute>
                    }
                  />
                </Route>
                <Route
                  path="/configuracion"
                  element={
                    <PrivateRoute>
                      <ConfigurationPage />
                    </PrivateRoute>
                  }
                >
                  <Route
                    path="puntos-venta"
                    element={
                      <PrivateRoute>
                        <PointsOfSalePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="promocion"
                    element={
                      <PrivateRoute>
                        <PromotionsPage />
                      </PrivateRoute>
                    }
                  />
                </Route>
                <Route
                  path="/ventas"
                  element={
                    <PrivateRoute>
                      <PointOfSalePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <PrivateRoute>
                      <ClientsPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
