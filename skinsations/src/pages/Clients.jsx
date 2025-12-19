import {useEffect, useState} from "react";
import {collection, onSnapshot} from "firebase/firestore";
import {db} from "../services/firebase.js";
import {Link} from "react-router-dom";

export default function Clients() {
    const [list, setList] = useState([]);
    const [searchPhone, setSearchPhone] = useState("");
    const [searchName, setSearchName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 12;

    useEffect(() => {
        return onSnapshot(collection(db, "clients"), snap => {
            setList(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
    }, []);

    // Filter clients by phone number and name
    const filteredClients = list.filter(client => {
        const matchPhone = client.telephone?.toLowerCase().includes(searchPhone.toLowerCase());
        const fullName = `${client.prenom || ''} ${client.nom || ''}`.toLowerCase();
        const matchName = fullName.includes(searchName.toLowerCase());
        return matchPhone && matchName;
    });

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchPhone, searchName]);

    // Pagination logic
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <h2 className="text-2xl font-bold text-rose-600 mb-6">Liste des clientes</h2>

            {/* Search Inputs */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-rose-700 font-medium mb-2">
                        Rechercher par nom
                    </label>
                    <input
                        type="text"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        placeholder="Entrez un nom ou prénom..."
                        className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-rose-700 font-medium mb-2">
                        Rechercher par téléphone
                    </label>
                    <input
                        type="text"
                        value={searchPhone}
                        onChange={e => setSearchPhone(e.target.value)}
                        placeholder="Entrez un numéro de téléphone..."
                        className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                    />
                </div>

                {(searchPhone || searchName) && (
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl px-4 py-3">
                            <p className="text-sm text-rose-600 font-medium">
                                {filteredClients.length} cliente(s) trouvée(s)
                            </p>
                            <button
                                onClick={() => {
                                    setSearchName("");
                                    setSearchPhone("");
                                }}
                                className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {filteredClients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    {searchPhone || searchName
                        ? "Aucune cliente trouvée avec ces critères de recherche."
                        : "Aucune cliente enregistrée."}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentClients.map(c => (
                            <Link
                                key={c.id}
                                to={`/client/${c.id}`}
                                className="block p-4 border border-pink-200 rounded-xl hover:shadow-lg hover:border-rose-300 transition-all bg-gradient-to-br from-pink-50 to-rose-50 hover:from-white hover:to-pink-50"
                            >
                                <div className="text-lg font-semibold text-rose-700 mb-1">
                                    {c.prenom} {c.nom}
                                </div>
                                <div className="text-sm text-rose-500">{c.telephone}</div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-pink-100 text-rose-700 hover:bg-pink-200'
                                    }`}
                                >
                                    ← Précédent
                                </button>

                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        const showPage =
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                                        if (!showPage) {
                                            // Show ellipsis
                                            if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                                return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                                                    currentPage === pageNumber
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                                                        : 'bg-pink-50 text-rose-600 hover:bg-pink-100'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-pink-100 text-rose-700 hover:bg-pink-200'
                                    }`}
                                >
                                    Suivant →
                                </button>
                            </div>

                            {/* Page Info */}
                            <p className="text-sm text-gray-600">
                                Page {currentPage} sur {totalPages} · {filteredClients.length} cliente(s) au total
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
