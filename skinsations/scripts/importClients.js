import XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCram578ndXAZg_0VAnL1thnljCiNzzIE0",
    authDomain: "skinsations-cc05a.firebaseapp.com",
    projectId: "skinsations-cc05a",
    storageBucket: "skinsations-cc05a.firebasestorage.app",
    messagingSenderId: "793899851624",
    appId: "1:793899851624:web:ecbf26e5886f69247440dd",
    measurementId: "G-9582JLTJZS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour convertir les dates Excel en format YYYY-MM-DD
function excelDateToJSDate(excelDate) {
    if (!excelDate || typeof excelDate !== 'number') return null;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
}

// Fonction pour parser les informations de séance
function parseSeanceInfo(cellValue) {
    if (!cellValue || cellValue === '') return null;

    const text = String(cellValue);

    // Extraire la date si elle existe
    let date = null;
    const dateMatch = text.match(/(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|aout|août|septembre|octobre|novembre|décembre|decembre)\s+(\d{4})/i);
    if (dateMatch) {
        const mois = {
            'janvier': '01', 'février': '02', 'fevrier': '02', 'mars': '03',
            'avril': '04', 'mai': '05', 'juin': '06', 'juillet': '07',
            'aout': '08', 'août': '08', 'septembre': '09', 'octobre': '10',
            'novembre': '11', 'décembre': '12', 'decembre': '12'
        };
        date = `${dateMatch[3]}-${mois[dateMatch[2].toLowerCase()]}-${dateMatch[1].padStart(2, '0')}`;
    }

    // Extraire la zone
    let zone = '';
    if (text.toLowerCase().includes('aisselle')) zone = 'Aisselles';
    else if (text.toLowerCase().includes('bikini')) zone = 'Bikini';
    else if (text.toLowerCase().includes('jambe')) zone = 'Jambes';
    else if (text.toLowerCase().includes('visage')) zone = 'Visage';

    // Extraire la machine
    let machine = '';
    if (text.toUpperCase().includes('VECTUS')) machine = 'VECTUS';
    else if (text.toUpperCase().includes('CLARITY')) machine = 'CLARITY';
    else if (text.toUpperCase().includes('ALEX') || text.toUpperCase().includes('YAG')) machine = 'CLARITY';

    return {
        date: date,
        zone: zone,
        machine: machine,
        parametres: text
    };
}

async function importClients() {
    try {
        const workbook = XLSX.readFile('/Users/abdou/Downloads/Suivi laser - Abdou.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir en tableau de lignes
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        console.log('📊 Analyse du fichier Excel...\n');

        let successCount = 0;
        let errorCount = 0;
        let seanceCount = 0;

        // Commencer à la ligne 5 (index 4) où commencent les données de clientes
        for (let i = 4; i < data.length; i++) {
            const row = data[i];

            // Colonne 1 contient le nom de la cliente
            const nomComplet = row[1];

            if (!nomComplet || nomComplet === '' || nomComplet === 'AFFECTATION') continue;

            try {
                // Extraire le nom et le numéro entre parenthèses
                const match = nomComplet.match(/^(.+?)\s*\((\d+)\)?\s*$/);
                let nom = nomComplet;
                let telephone = '';

                if (match) {
                    nom = match[1].trim();
                    telephone = match[2] || '';
                }

                // Séparer prénom et nom
                const parts = nom.split(' ');
                const prenom = parts[0] || '';
                const nomFamille = parts.slice(1).join(' ') || '';

                console.log(`\n👤 Traitement: ${prenom} ${nomFamille}`);

                // Créer le client
                const clientData = {
                    nom: nomFamille,
                    prenom: prenom,
                    telephone: telephone,
                    email: '',
                    dateNaissance: '',
                    photos: []
                };

                const clientRef = await addDoc(collection(db, 'clients'), clientData);
                successCount++;
                console.log(`   ✅ Cliente ajoutée`);

                // Traiter les séances (colonnes 2 à 15 correspondent aux séances 1 à 14)
                let clientSeanceCount = 0;
                for (let j = 2; j < 16; j++) {
                    const seanceData = row[j];
                    if (!seanceData || seanceData === '') continue;

                    const seanceInfo = parseSeanceInfo(seanceData);
                    if (!seanceInfo) continue;

                    // Ajouter la séance
                    await addDoc(collection(db, 'seances'), {
                        clientId: clientRef.id,
                        numero: j - 1, // Numéro de séance (1 à 14)
                        date: seanceInfo.date || '',
                        zone: seanceInfo.zone,
                        machine: seanceInfo.machine,
                        parametres: seanceInfo.parametres
                    });

                    clientSeanceCount++;
                    seanceCount++;
                }

                if (clientSeanceCount > 0) {
                    console.log(`   📋 ${clientSeanceCount} séance(s) ajoutée(s)`);
                }

            } catch (error) {
                errorCount++;
                console.error(`   ❌ Erreur pour ${nomComplet}:`, error.message);
            }
        }

        console.log('\n\n✨ Import terminé!');
        console.log(`✅ Clientes importées: ${successCount}`);
        console.log(`📋 Séances importées: ${seanceCount}`);
        console.log(`❌ Erreurs: ${errorCount}`);

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
    }
}

importClients();
