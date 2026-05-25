// js/ui.js

// Funkcja pomocnicza: Zamienia "ENCHANTED_DIAMOND" na "Enchanted Diamond"
export function formatItemName(internalName) {
    return internalName
        // API uzywa podkreslen, a uzytkownikowi lepiej czyta sie spacje.
        .replace(/_/g, ' ')
        .toLowerCase()
        // Kazde slowo zaczynamy wielka litera.
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Funkcja pomocnicza: Formatuje długie liczby z jednym miejscem po przecinku
export function formatNumber(num) {
    // Format pl-PL dodaje polskie separatory tysiecy i przecinek dziesietny.
    return Number(num).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
}

// Globalna mapa materiałów pobrana z Hypixel Items API
let materialMap = {};

// Setter wywoływany z main.js po pobraniu danych
export function setMaterialMap(map) {
    // Zapamietujemy mape materialow, aby inne funkcje mogly dobrac ikonki.
    materialMap = map;
}

/**
 * Zwraca URL do ikony przedmiotu.
 * Używa pola "material" z Hypixel Items API (np. "diamond", "iron_ingot")
 * i pobiera teksturę z CDN minecraft-assets na GitHubie.
 * Jeśli brak danych - próbuje zgadnąć na podstawie ID.
 */
export function getItemIconUrl(itemId) {
    // 1. Pobieramy materiał z mapy (np. "diamond", "iron_ingot", "cobblestone")
    let material = materialMap[itemId];

    // 2. Jeśli nie ma w mapie, próbujemy zgadnąć usuwając ENCHANTED_ i lowercase
    if (!material) {
        material = itemId.replace(/^ENCHANTED_/, '').toLowerCase();
    }

    // 3. Sprawdzamy czy to blok czy item na podstawie nazwy
    const blockMaterials = [
        'cobblestone', 'obsidian', 'coal_block', 'iron_block', 'gold_block',
        'diamond_block', 'emerald_block', 'redstone_block', 'lapis_block',
        'quartz_block', 'sandstone', 'dirt', 'gravel', 'sand', 'netherrack',
        'soul_sand', 'glowstone', 'sea_lantern', 'sponge', 'cactus',
        'melon_block', 'pumpkin', 'hay_block', 'bone_block', 'nether_brick',
        'end_stone', 'mycelium', 'clay', 'hardened_clay', 'stained_clay',
        'ice', 'packed_ice', 'snow', 'mossy_cobblestone', 'web', 'cobweb'
    ];

    const isBlock = blockMaterials.includes(material);
    // Tekstury Minecrafta sa w dwoch folderach: block albo item.
    const folder = isBlock ? 'block' : 'item';

    return `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.16.5/assets/minecraft/textures/${folder}/${material}.png`;
}

// WIDOK RYNKU: renderowanie kart
export function renderMarketItems(items, append = false) {
    const gridContainer = document.getElementById('items-grid');
    if (!gridContainer) return;

    if (!append) {
        // Gdy nie dopisujemy kolejnej strony, czyscimy poprzednie karty.
        gridContainer.innerHTML = '';
    }

    items.forEach(item => {
        // Ceny bierzemy z quick_status; brak danych zastepujemy zerem.
        const buyPrice = item.quick_status?.buyPrice || 0;
        const sellPrice = item.quick_status?.sellPrice || 0;
        const iconUrl = getItemIconUrl(item.product_id);

        // Tworzymy pojedyncza karte przedmiotu.
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


// WIDOK SZCZEGÓŁÓW
export function renderItemDetails(item) {
    const buyPrice = item.quick_status?.buyPrice || 0;
    const sellPrice = item.quick_status?.sellPrice || 0;
    // Spread to roznica miedzy cena kupna i sprzedazy.
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
        // Dodatni spread pokazujemy na zielono, pozostale wartosci na czerwono.
        marginEl.style.color = margin > 0 ? '#55ff55' : '#ff5555';
    }
}

// WIDOK PORTFELA
export function renderPortfolio(enrichedPortfolio, onRemove) {
    const list = document.getElementById('saved-items-list');
    if (!list) return;

    if (enrichedPortfolio.length === 0) {
        list.innerHTML = '<li class="empty-portfolio">Brak przedmiotów w portfelu.</li>';
        return;
    }

    let totalValue = 0;

    list.innerHTML = enrichedPortfolio.map(entry => {
        // Wartoscia wpisu jest liczba sztuk pomnozona przez aktualna cene sprzedazy.
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

    const existing = document.getElementById('portfolio-total');
    if (existing) existing.remove();
    // Po wyrenderowaniu pozycji dodajemy osobny wiersz z suma portfela.
    const summary = document.createElement('li');
    summary.id = 'portfolio-total';
    summary.className = 'portfolio-total';
    summary.innerHTML = `<strong>Łączna wartość portfela: ${formatNumber(totalValue)} monet</strong>`;
    list.appendChild(summary);

    list.querySelectorAll('.remove-btn').forEach(btn => {
        // Kazdy przycisk usuwa przedmiot o ID zapisanym w data-id.
        btn.addEventListener('click', () => onRemove(btn.dataset.id));
    });
}
