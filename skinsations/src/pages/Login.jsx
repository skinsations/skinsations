import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const nav = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            // L'email admin est admin@skinsations.com
            const email = username === "admin" ? "admin@skinsations.com" : username;
            await signInWithEmailAndPassword(auth, email, password);
            nav("/");
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError("Nom d'utilisateur ou mot de passe incorrect");
            setPassword("");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-pink-200">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-rose-600 mb-2">Skinsations</h1>
                    <p className="text-rose-500 text-lg font-medium">Esthétiques</p>
                    <div className="mt-4 w-16 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full"></div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-rose-700 font-medium mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
                            placeholder="Entrez votre nom d'utilisateur"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-rose-700 font-medium mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
                            placeholder="Entrez votre mot de passe"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Se connecter
                    </button>
                </form>

                {/* Decorative elements */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Bienvenue sur votre espace de gestion</p>
                </div>
            </div>
        </div>
    );
}
