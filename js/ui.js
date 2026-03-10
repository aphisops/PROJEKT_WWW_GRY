// js/ui.js

// Funkcja pomocnicza: Zamienia "ENCHANTED_DIAMOND" na "Enchanted Diamond"
export function formatItemName(internalName) {
    return internalName
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Funkcja pomocnicza: Formatuje długie liczby, dodając przecinki i jedno miejsce po przecinku
export function formatNumber(num) {
    return Number(num).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
}

// Słownik tłumaczący specyficzne ID Hypixela na ścieżki do tekstur z Minecrafta 1.16
const iconMap = {
    // Przedmioty (items)
    'DIAMOND': 'item/diamond',
    'EMERALD': 'item/emerald',
    'GOLD_INGOT': 'item/gold_ingot',
    'IRON_INGOT': 'item/iron_ingot',
    'WHEAT': 'item/wheat',
    'CARROT_ITEM': 'item/carrot',       
    'POTATO_ITEM': 'item/potato',
    'PORK': 'item/porkchop',            
    'CORRUPTED_BAIT': 'item/phantom_membrane', 
    'ENCHANTED_DIAMOND': 'item/diamond', // Zwykle zaczarowane mają tę samą ikonę
    
    // Bloki (blocks)
    'COBBLESTONE': 'block/cobblestone',
    'OBSIDIAN': 'block/obsidian',
    'COAL_BLOCK': 'block/coal_block',
    'TARANTULA_WEB': 'block/cobweb',
    'CACTUS': 'block/cactus'
};

// Funkcja pobierająca odpowiedni link do obrazka
export function getItemIconUrl(itemId) {
    // 1. Usuwamy przedrostki ENCHANTED_, żeby uprościć szukanie (np. ENCHANTED_PORK -> PORK)
    let cleanId = itemId.replace('ENCHANTED_', '');
    
    // 2. Sprawdzamy czy mamy ten przedmiot w naszym słowniku (szukamy czystego lub z przedrostkiem)
    let assetPath = iconMap[cleanId] || iconMap[itemId];

    // 3. Jeśli nie ma go w słowniku, domyślnie szukamy w folderze item/
    if (!assetPath) {
        assetPath = `item/${cleanId.toLowerCase()}`;
    }

    // Zwracamy pełny link z darmowego repozytorium GitHub (CDN)
    return `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.16.5/assets/minecraft/textures/${assetPath}.png`;
}

// Główna funkcja renderująca kafelki na rynku
export function renderMarketItems(items) {
    const gridContainer = document.getElementById('items-grid');
    
    if (!gridContainer) return; // Zabezpieczenie przed brakiem elementu

    gridContainer.innerHTML = ''; // Czyścimy kontener przed nowym renderowaniem

    items.forEach(item => {
        // Zabezpieczenie przed brakiem danych w API (wymóg oceny z obsługi błędów)
        const buyPrice = item.quick_status?.buyPrice || 0;
        const sellPrice = item.quick_status?.sellPrice || 0;
        
        // Pobieramy link do ikonki
        const iconUrl = getItemIconUrl(item.product_id);
        
        // Tworzymy element karty dla pojedynczego przedmiotu
        const card = document.createElement('div');
        card.className = 'item-card';
        
        // Wypełniamy div dynamicznym HTML-em
        // Atrybut onerror ładuje domyślną skrzynkę z darmowego API, jeśli tekstury z CDN nie ma
        card.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="${iconUrl}" 
                     alt="${item.product_id}" 
                     style="width: 50px; height: 50px; image-rendering: pixelated;"
                     onerror="this.src='https://mc-heads.net/avatar/MHF_Chest/50'">
            </div>
            <h3 style="text-align: center;">${formatItemName(item.product_id)}</h3>
            <div class="price-info">
                <p><span>Kupno:</span> <strong style="color: #ffaa00;">${formatNumber(buyPrice)}</strong></p>
                <p><span>Sprzedaż:</span> <strong style="color: #55ff55;">${formatNumber(sellPrice)}</strong></p>
            </div>
            <button class="details-btn" data-id="${item.product_id}">Zobacz szczegóły</button>
        `;
        
        gridContainer.appendChild(card);
    });
}