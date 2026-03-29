// js/ui.js

// Funkcja pomocnicza: Zamienia "ENCHANTED_DIAMOND" na "Enchanted Diamond"
export function formatItemName(internalName) {
    return internalName
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Funkcja pomocnicza: Formatuje długie liczby z jednym miejscem po przecinku
export function formatNumber(num) {
    return Number(num).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
}

// Słownik tłumaczący ID Hypixela na ścieżki tekstur Minecrafta 1.16
const iconMap = {
    'DIAMOND': 'item/diamond',
    'EMERALD': 'item/emerald',
    'GOLD_INGOT': 'item/gold_ingot',
    'IRON_INGOT': 'item/iron_ingot',
    'WHEAT': 'item/wheat',
    'CARROT_ITEM': 'item/carrot',
    'POTATO_ITEM': 'item/potato',
    'PORK': 'item/porkchop',
    'CORRUPTED_BAIT': 'item/phantom_membrane',
    'ENCHANTED_DIAMOND': 'item/diamond',
    'COBBLESTONE': 'block/cobblestone',
    'OBSIDIAN': 'block/obsidian',
    'COAL_BLOCK': 'block/coal_block',
    'TARANTULA_WEB': 'block/cobweb',
    'CACTUS': 'block/cactus'
};

// Pobiera link do obrazka dla danego ID przedmiotu
export function getItemIconUrl(itemId) {
    let cleanId = itemId.replace('ENCHANTED_', '');
    let assetPath = iconMap[cleanId] || iconMap[itemId];
    if (!assetPath) {
        assetPath = `item/${cleanId.toLowerCase()}`;
    }
    return `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.16.5/assets/minecraft/textures/${assetPath}.png`;
}

// ==========================================
// WIDOK RYNKU: renderowanie kart
// POPRAWKA: parametr append pozwala dołączać karty (paginacja)
// ==========================================
export function renderMarketItems(items, append = false) {
    const gridContainer = document.getElementById('items-grid');
    if (!gridContainer) return;

    if (!append) {
        gridContainer.innerHTML = '';
    }

    items.forEach(item => {
        const buyPrice = item.quick_status?.buyPrice || 0;
        const sellPrice = item.quick_status?.sellPrice || 0;
        const iconUrl = getItemIconUrl(item.product_id);

        const card = document.createElement('div');
        card.className = 'item-card';
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

// ==========================================
// WIDOK SZCZEGÓŁÓW: wypełnienie danych
// POPRAWKA: brakowało tej funkcji - widok szczegółów nigdy się nie wypełniał
// ==========================================
export function renderItemDetails(item) {
    const buyPrice = item.quick_status?.buyPrice || 0;
    const sellPrice = item.quick_status?.sellPrice || 0;
    const margin = buyPrice - sellPrice;

    const nameEl = document.getElementById('detail-name');
    const buyEl = document.getElementById('detail-buy');
    const sellEl = document.getElementById('detail-sell');
    const marginEl = document.getElementById('detail-margin');

    if (nameEl) nameEl.textContent = formatItemName(item.product_id);
    if (buyEl) buyEl.textContent = formatNumber(buyPrice) + ' monet';
    if (sellEl) sellEl.textContent = formatNumber(sellPrice) + ' monet';
    if (marginEl) {
        marginEl.textContent = formatNumber(margin) + ' monet';
        marginEl.style.color = margin > 0 ? '#55ff55' : '#ff5555';
    }
}

// ==========================================
// WIDOK PORTFELA: renderowanie listy aktywów
// POPRAWKA: brakowało tej funkcji - portfel nie wyświetlał danych
// ==========================================
export function renderPortfolio(enrichedPortfolio, onRemove) {
    const list = document.getElementById('saved-items-list');
    if (!list) return;

    if (enrichedPortfolio.length === 0) {
        list.innerHTML = '<li class="empty-portfolio">Brak przedmiotów w portfelu.</li>';
        return;
    }

    let totalValue = 0;

    list.innerHTML = enrichedPortfolio.map(entry => {
        const value = entry.sellPrice * entry.quantity;
        totalValue += value;
        return `
            <li class="portfolio-item">
                <div class="portfolio-info">
                    <strong>${formatItemName(entry.productId)}</strong>
                    <span>Ilość: ${entry.quantity}</span>
                    <span>Cena sprzedaży: ${formatNumber(entry.sellPrice)} / szt.</span>
                    <span class="portfolio-value">Wartość: <strong>${formatNumber(value)}</strong> monet</span>
                </div>
                <button class="remove-btn" data-id="${entry.productId}">Usuń</button>
            </li>
        `;
    }).join('');

    // Podsumowanie
    const existing = document.getElementById('portfolio-total');
    if (existing) existing.remove();
    const summary = document.createElement('li');
    summary.id = 'portfolio-total';
    summary.className = 'portfolio-total';
    summary.innerHTML = `<strong>Łączna wartość portfela: ${formatNumber(totalValue)} monet</strong>`;
    list.appendChild(summary);

    // Eventy usuwania
    list.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => onRemove(btn.dataset.id));
    });
}