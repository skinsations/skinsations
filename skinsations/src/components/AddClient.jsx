import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { useNavigate } from "react-router-dom";

export default function AddClient() {
    const nav = useNavigate();
    const [nom, setNom] = useState("");
    const [tel, setTel] = useState("");
    const [notes, setNotes] = useState("");

    async function save() {
        if (nom.length < 2) return;

        await addDoc(collection(db, "clients"), {
            nom,
            telephone: tel,
            notes
        });

        nav("/");
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">Ajouter une cliente</h2>

            <div className="mb-4">
                <label className="block text-rose-700 font-medium mb-2">Nom</label>
                <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Entrez le nom"
                />
            </div>

            <div className="mb-4">
                <label className="block text-rose-700 font-medium mb-2">Téléphone</label>
                <input
                    type="tel"
                    value={tel}
                    onChange={e => setTel(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Entrez le téléphone"
                />
            </div>

            <div className="mb-6">
                <label className="block text-rose-700 font-medium mb-2">Notes</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Notes sur la cliente"
                    rows="4"
                />
            </div>

            <button
                onClick={save}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                disabled={nom.length < 2}
            >
                Ajouter
            </button>
        </div>
    );
}
