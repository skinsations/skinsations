import {useEffect, useState} from "react";
import {collection, onSnapshot, deleteDoc, doc, query, where, getDocs} from "firebase/firestore";
import {ref, deleteObject} from "firebase/storage";
import {db, storage} from "../services/firebase.js";
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

    // Delete client handler
    async function handleDeleteClient(e, client) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ? Cette action supprimera également toutes ses séances et photos.`)) {
            return;
        }

        try {
            // Delete all seances for this client
            const seancesQuery = query(collection(db, "seances"), where("clientId", "==", client.id));
            const seancesSnap = await getDocs(seancesQuery);
            for (const seanceDoc of seancesSnap.docs) {
                await deleteDoc(seanceDoc.ref);
            }

            // Delete all photos from storage
            if (client.photos && client.photos.length > 0) {
                for (const photo of client.photos) {
                    try {
                        const storageRef = ref(storage, photo.filename);
                        await deleteObject(storageRef);
                    } catch (err) {
                        console.error("Error deleting photo:", err);
                    }
                }
            }

            // Delete the client document
            await deleteDoc(doc(db, "clients", client.id));
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("Erreur lors de la suppression de la cliente");
        }
    }

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
                            <div
                                key={c.id}
                                className="relative group p-4 border border-pink-200 rounded-xl hover:shadow-lg hover:border-rose-300 transition-all bg-gradient-to-br from-pink-50 to-rose-50 hover:from-white hover:to-pink-50"
                            >
                                <Link to={`/client/${c.id}`} className="block">
                                    <div className="text-lg font-semibold text-rose-700 mb-1">
                                        {c.prenom} {c.nom}
                                    </div>
                                    <div className="text-sm text-rose-500">{c.telephone}</div>
                                </Link>
                                <button
                                    onClick={(e) => handleDeleteClient(e, c)}
                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Supprimer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
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
