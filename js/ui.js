// Funkcja pomocnicza: Zamienia "ENCHANTED_DIAMOND" na "Enchanted Diamond"
function formatItemName(internalName) {
    return internalName
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Funkcja pomocnicza: Formatuje długie liczby, dodając przecinki
function formatNumber(num) {
    return Number(num).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
}

// Główna funkcja renderująca kafelki na rynku
export function renderMarketItems(items) {
    const gridContainer = document.getElementById('items-grid');
    
    if (!gridContainer) return; // Zabezpieczenie, jeśli elementu nie ma

    gridContainer.innerHTML = ''; // Czyścimy kontener

    items.forEach(item => {
        // Zabezpieczenie przed brakiem danych
        const buyPrice = item.quick_status?.buyPrice || 0;
        const sellPrice = item.quick_status?.sellPrice || 0;
        
        // Tworzymy pusty element <div>
        const card = document.createElement('div');
        card.className = 'item-card';
        
        // Wypełniamy div dynamicznym HTML-em
        card.innerHTML = `
            <h3>${formatItemName(item.product_id)}</h3>
            <div class="price-info">
                <p><span>Kupno:</span> <strong>${formatNumber(buyPrice)}</strong></p>
                <p><span>Sprzedaż:</span> <strong>${formatNumber(sellPrice)}</strong></p>
            </div>
            <button class="details-btn" data-id="${item.product_id}">Zobacz szczegóły</button>
        `;
        
        gridContainer.appendChild(card);
    });
}