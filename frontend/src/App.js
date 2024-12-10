import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TablePage from "./pages/TablePage";
import TrackOrders from "./pages/TrackOrders"; 
import Checkout from "./pages/Checkout"; 
import AdminDashboard from "./pages/AdminDashboard";
import AddMenuItem from "./pages/AddMenuItem";
import EditMenuItem from "./pages/EditMenuItem";
import DeleteMenuItem from "./pages/DeleteMenuItem";
import ManageOrders from "./pages/ManageOrders";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/table/:table_id" element={<TablePage />} />
                <Route path="/table/:table_id/track-orders" element={<TrackOrders />} /> 
                <Route path="/table/:table_id/checkout" element={<Checkout />} /> 
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/add" element={<AddMenuItem />} />
                <Route path="/admin/edit" element={<EditMenuItem />} />
                <Route path="/admin/delete" element={<DeleteMenuItem />} />
                <Route path="/admin/orders" element={<ManageOrders />} />
            </Routes>
        </Router>
    );
}

export default App;
