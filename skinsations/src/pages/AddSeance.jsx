import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../services/firebase.js";

export default function AddSeance() {
    const { id } = useParams();
    const nav = useNavigate();

    const [date, setDate] = useState("");
    const [zone, setZone] = useState("");
    const [machine, setMachine] = useState("");
    const [longueurOndes, setLongueurOndes] = useState("");
    const [parametres, setParametres] = useState("");
    const [notes, setNotes] = useState("");
    const [retard, setRetard] = useState("");
    const [numero, setNumero] = useState("");

    async function save() {
        await addDoc(collection(db, "seances"), {
            clientId: id,
            date,
            zone,
            machine,
            longueurOndes,
            parametres,
            notes,
            retard,
            numero: Number(numero)
        });
        nav(`/client/${id}`);
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">Ajouter une séance</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-rose-700 font-medium mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Numéro de séance</label>
                    <select
                        value={numero}
                        onChange={e => setNumero(e.target.value)}
                        className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                    >
                        <option value="">Sélectionner...</option>
                        {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>Séance {i + 1}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Zone</label>
                <input
                    type="text"
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Ex: Visage, Jambes, etc."
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Machine</label>
                <select
                    value={machine}
                    onChange={e => setMachine(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                >
                    <option value="">Sélectionner...</option>
                    <option value="VECTUS">VECTUS</option>
                    <option value="CLARITY">CLARITY</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Longueur d'ondes</label>
                <select
                    value={longueurOndes}
                    onChange={e => setLongueurOndes(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                >
                    <option value="">Sélectionner...</option>
                    <option value="Alex">Alex</option>
                    <option value="Yag">Yag</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Paramètres</label>
                <textarea
                    value={parametres}
                    onChange={e => setParametres(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Détails des paramètres utilisés"
                    rows="3"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Notes</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    placeholder="Notes additionnelles"
                    rows="3"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Retard</label>
                <select
                    value={retard}
                    onChange={e => setRetard(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                >
                    <option value="">Sélectionner...</option>
                    <option value="1 semaine">1 semaine</option>
                    <option value="2 semaines">2 semaines</option>
                    <option value="3 semaines">3 semaines</option>
                    <option value="4 semaines et plus">4 semaines et plus</option>
                </select>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => nav(`/client/${id}`)}
                    className="flex-1 py-3 bg-pink-100 text-rose-700 font-semibold rounded-xl hover:bg-pink-200 transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={save}
                    className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-colors shadow-md"
                >
                    Enregistrer
                </button>
            </div>
        </div>
    );
}
