import XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/abdou/Downloads/Suivi laser - Abdou.xlsx');

console.log('📚 Feuilles disponibles:', workbook.SheetNames);
console.log('\n');

// Afficher les premières lignes de chaque feuille
workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n========== FEUILLE ${index + 1}: "${sheetName}" ==========`);

    const worksheet = workbook.Sheets[sheetName];

    // Convertir en JSON avec options pour garder les en-têtes
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    console.log(`\n📊 Premières 10 lignes:\n`);
    data.slice(0, 10).forEach((row, idx) => {
        console.log(`Ligne ${idx + 1}:`, row);
    });

    console.log(`\n📏 Total de lignes: ${data.length}`);
});
