import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import Clients from "./pages/Clients.jsx";
import AddClient from "./components/AddClient.jsx";
import Client from "./pages/Client.jsx";
import AddSeance from "./pages/AddSeance";
import EditSeance from "./pages/EditSeance";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const isLoginPage = location.pathname === "/login";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        }
    }

    return (
        <div className="min-h-screen bg-pink-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {!isLoginPage && user && (
                    <header className="mb-8 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl shadow-lg p-6 border border-pink-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-rose-600 mb-2">Skinsations</h1>
                                <p className="text-rose-500 text-lg font-medium">Esthétiques</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl transition-colors font-medium"
                            >
                                Déconnexion
                            </button>
                        </div>

                        <nav className="flex gap-4">
                            <Link
                                to="/"
                                className="px-4 py-2 text-rose-700 hover:text-rose-600 hover:bg-pink-50 rounded-xl transition-colors font-medium"
                            >
                                Clientes
                            </Link>
                            <Link
                                to="/add"
                                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 rounded-xl transition-colors font-medium shadow-md"
                            >
                                Ajouter
                            </Link>
                        </nav>
                    </header>
                )}

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                    <Route path="/add" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
                    <Route path="/client/:id" element={<ProtectedRoute><Client /></ProtectedRoute>} />
                    <Route path="/add-seance/:id" element={<ProtectedRoute><AddSeance /></ProtectedRoute>} />
                    <Route path="/edit-seance/:clientId/:seanceId" element={<ProtectedRoute><EditSeance /></ProtectedRoute>} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
