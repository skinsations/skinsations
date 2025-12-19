import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../services/firebase.js";

export default function Client() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [seances, setSeances] = useState([]);
    const [filterNumero, setFilterNumero] = useState("");
    const [filterMachine, setFilterMachine] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [editForm, setEditForm] = useState({ prenom: "", nom: "", telephone: "" });

    useEffect(() => {
        // Fetch client data
        async function fetchClient() {
            const docRef = doc(db, "clients", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setClient({ id: docSnap.id, ...docSnap.data() });
            }
        }
        fetchClient();

        // Subscribe to seances for this client
        const q = query(collection(db, "seances"), where("clientId", "==", id));
        const unsubscribe = onSnapshot(q, (snap) => {
            const seancesList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort by session number
            seancesList.sort((a, b) => a.numero - b.numero);
            setSeances(seancesList);
        });

        return () => unsubscribe();
    }, [id]);

    // Constant filter options
    const MACHINES = ["VECTUS", "CLARITY"];
    const SESSION_NUMBERS = [...Array(20)].map((_, i) => i + 1);

    // Filter seances based on selected filters
    const filteredSeances = seances.filter(seance => {
        const matchNumero = !filterNumero || seance.numero?.toString() === filterNumero;
        const matchMachine = !filterMachine || seance.machine === filterMachine;
        return matchNumero && matchMachine;
    });

    // Photo upload handler
    async function handlePhotoUpload(e) {
        const files = Array.from(e.target.files);
        const currentPhotos = client.photos || [];

        if (currentPhotos.length + files.length > 7) {
            alert(`Vous ne pouvez téléverser que ${7 - currentPhotos.length} photo(s) supplémentaire(s). Maximum 7 photos par cliente.`);
            return;
        }

        setUploading(true);
        try {
            for (const file of files) {
                // Create unique filename
                const timestamp = Date.now();
                const filename = `clients/${id}/${timestamp}_${file.name}`;
                const storageRef = ref(storage, filename);

                // Upload file
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                // Add photo URL to client document
                const clientRef = doc(db, "clients", id);
                await updateDoc(clientRef, {
                    photos: arrayUnion({ url, filename, uploadedAt: timestamp })
                });
            }
            // Refresh page after successful upload
            window.location.reload();
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Erreur lors du téléversement de la photo");
            setUploading(false);
        }
    }

    // Photo delete handler
    async function handlePhotoDelete(photo) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
            return;
        }

        try {
            // Delete from storage
            const storageRef = ref(storage, photo.filename);
            await deleteObject(storageRef);

            // Remove from client document
            const clientRef = doc(db, "clients", id);
            await updateDoc(clientRef, {
                photos: arrayRemove(photo)
            });
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert("Erreur lors de la suppression de la photo");
        }
    }

    // Open edit modal with current client data
    function openEditModal() {
        setEditForm({
            prenom: client.prenom || "",
            nom: client.nom || "",
            telephone: client.telephone || "",
            notes: client.notes || ""
        });
        setIsEditingClient(true);
    }

    // Save client changes
    async function saveClientChanges() {
        try {
            const clientRef = doc(db, "clients", id);
            await updateDoc(clientRef, {
                prenom: editForm.prenom,
                nom: editForm.nom,
                telephone: editForm.telephone,
                notes: editForm.notes
            });

            // Update local state
            setClient(prev => ({
                ...prev,
                prenom: editForm.prenom,
                nom: editForm.nom,
                telephone: editForm.telephone,
                notes: editForm.notes
            }));

            setIsEditingClient(false);
            alert("Informations mises à jour avec succès !");
        } catch (error) {
            console.error("Error updating client:", error);
            alert("Erreur lors de la mise à jour des informations");
        }
    }

    if (!client) {
        return <div className="text-center py-8">Chargement...</div>;
    }

    const photos = client.photos || [];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Client Header */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl shadow-lg p-6 mb-6 border border-pink-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-rose-600 mb-2">
                            {client.prenom} {client.nom}
                        </h2>
                        <p className="text-rose-500 text-lg mb-4">{client.telephone}</p>

                        {/* Notes du profil */}
                        {client.notes && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-pink-200">
                                <h3 className="text-lg font-semibold text-rose-600 mb-2">Notes</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 ml-4">
                        <button
                            onClick={openEditModal}
                            className="bg-pink-100 hover:bg-pink-200 text-rose-700 px-6 py-2 rounded-xl font-medium transition-colors"
                        >
                            Modifier
                        </button>
                        <Link
                            to={`/add-seance/${id}`}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-md"
                        >
                            Ajouter une séance
                        </Link>
                    </div>
                </div>
            </div>

            {/* Photos Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-rose-600">
                        Photos ({photos.length}/7)
                    </h3>
                    {photos.length < 7 && (
                        <label className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-colors cursor-pointer shadow-md">
                            {uploading ? "Téléversement..." : "Ajouter des photos"}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {photos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Aucune photo téléversée pour cette cliente.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={photo.url}
                                    alt={`Photo ${index + 1}`}
                                    onClick={() => setSelectedPhoto(photo)}
                                    className="w-full h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePhotoDelete(photo);
                                    }}
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
                )}

                {photos.length >= 7 && (
                    <p className="text-orange-600 text-sm mt-4 text-center font-medium">
                        Maximum de 7 photos atteint. Supprimez une photo pour en ajouter une nouvelle.
                    </p>
                )}
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                <h3 className="text-2xl font-semibold text-rose-600 mb-4">
                    Historique des séances ({seances.length})
                </h3>

                {/* Filters */}
                {seances.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                        <div>
                            <label className="block text-rose-700 font-medium mb-2 text-sm">
                                Filtrer par numéro de séance
                            </label>
                            <select
                                value={filterNumero}
                                onChange={e => setFilterNumero(e.target.value)}
                                className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Toutes les séances</option>
                                {SESSION_NUMBERS.map(num => (
                                    <option key={num} value={num}>Séance #{num}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-rose-700 font-medium mb-2 text-sm">
                                Filtrer par machine
                            </label>
                            <select
                                value={filterMachine}
                                onChange={e => setFilterMachine(e.target.value)}
                                className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Toutes les machines</option>
                                {MACHINES.map(machine => (
                                    <option key={machine} value={machine}>{machine}</option>
                                ))}
                            </select>
                        </div>

                        {(filterNumero || filterMachine) && (
                            <div className="md:col-span-2 flex items-center justify-between">
                                <p className="text-sm text-rose-600">
                                    {filteredSeances.length} séance(s) trouvée(s)
                                </p>
                                <button
                                    onClick={() => {
                                        setFilterNumero("");
                                        setFilterMachine("");
                                    }}
                                    className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {seances.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Aucune séance enregistrée pour cette cliente.
                    </p>
                ) : filteredSeances.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Aucune séance ne correspond aux filtres sélectionnés.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {filteredSeances.map((seance) => (
                            <div
                                key={seance.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            Séance #{seance.numero}
                                        </span>
                                        <span className="text-gray-600">{seance.date}</span>
                                    </div>
                                    <Link
                                        to={`/edit-seance/${id}/${seance.id}`}
                                        className="px-4 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                    >
                                        Modifier
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                    <div>
                                        <span className="text-gray-500 text-sm">Zone:</span>
                                        <p className="font-medium text-gray-800">{seance.zone}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">Machine:</span>
                                        <p className="font-medium text-gray-800">{seance.machine}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">Longueur d'ondes:</span>
                                        <p className="font-medium text-gray-800">{seance.longueurOndes || "-"}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">Paramètres:</span>
                                        <p className="font-medium text-gray-800">{seance.parametres}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">Retard:</span>
                                        <p className="font-medium text-gray-800">{seance.retard || "-"}</p>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <span className="text-gray-500 text-sm">Notes:</span>
                                        <p className="font-medium text-gray-800">{seance.notes || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Back Link */}
            <div className="mt-6">
                <Link to="/" className="text-rose-600 hover:text-rose-800 font-medium">
                    ← Retour à la liste
                </Link>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image */}
                        <img
                            src={selectedPhoto.url}
                            alt="Photo en grand"
                            className="w-full h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Delete button in modal */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(null);
                                handlePhotoDelete(selectedPhoto);
                            }}
                            className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Supprimer
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Client Modal */}
            {isEditingClient && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsEditingClient(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-pink-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-rose-600 mb-6">
                            Modifier les informations
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-rose-700 font-medium mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={editForm.prenom}
                                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                                    placeholder="Prénom de la cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-rose-700 font-medium mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={editForm.nom}
                                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                                    placeholder="Nom de famille"
                                />
                            </div>

                            <div>
                                <label className="block text-rose-700 font-medium mb-2">
                                    Numéro de téléphone
                                </label>
                                <input
                                    type="text"
                                    value={editForm.telephone}
                                    onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                                    placeholder="Numéro de téléphone"
                                />
                            </div>

                            <div>
                                <label className="block text-rose-700 font-medium mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                                    placeholder="Notes sur la cliente"
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setIsEditingClient(false)}
                                className="flex-1 py-3 bg-pink-100 text-rose-700 font-semibold rounded-xl hover:bg-pink-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={saveClientChanges}
                                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-colors shadow-md"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
