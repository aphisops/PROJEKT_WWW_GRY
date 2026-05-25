// js/main.js
import { fetchBazaarData, fetchItemMaterials } from './api.js';
import { renderMarketItems, renderItemDetails, renderPortfolio, formatItemName, setMaterialMap } from './ui.js';

// STAN APLIKACJI
let allItems = [];         // Wszystkie pobrane przedmioty
let filteredItems = [];    // Po filtrowaniu/sortowaniu
let currentPage = 0;       // Aktualna strona paginacji
const PAGE_SIZE = 20;      // Ile kart na raz

// HELPERS: WIDOKI
function showView(viewId) {
    // Najpierw ukrywamy wszystkie widoki.
    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('active-view');
    });
    const target = document.getElementById(viewId);
    if (target) {
        // Potem pokazujemy tylko ten widok, ktory zostal wybrany.
        target.classList.remove('hidden');
        target.classList.add('active-view');
    }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    // toggle dodaje klase, gdy drugi argument to true, albo usuwa, gdy false.
    if (loader) loader.classList.toggle('hidden', !show);
}

function showError(show) {
    const err = document.getElementById('error-message');
    if (err) err.classList.toggle('hidden', !show);
}

// RYNEK: FILTROWANIE, SORTOWANIE, PAGINACJA
function applyFiltersAndSort() {
    // Pobieramy aktualny tekst z wyszukiwarki i wybrany typ sortowania.
    const query = document.getElementById('search-input')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sort-select')?.value || 'name';

    // Filtrowanie po nazwie
    filteredItems = allItems.filter(item =>
        item.product_id.toLowerCase().includes(query)
    );

    // Sortowanie
    filteredItems.sort((a, b) => {
        // Jesli API nie zwroci ceny, traktujemy ja jako 0.
        const aBuy = a.quick_status?.buyPrice || 0;
        const bBuy = b.quick_status?.buyPrice || 0;
        const aMargin = (a.quick_status?.buyPrice || 0) - (a.quick_status?.sellPrice || 0);
        const bMargin = (b.quick_status?.buyPrice || 0) - (b.quick_status?.sellPrice || 0);

        if (sortBy === 'margin-desc') return bMargin - aMargin;
        if (sortBy === 'price-desc') return bBuy - aBuy;
        return a.product_id.localeCompare(b.product_id); // name
    });

    // Reset paginacji i renderowanie
    currentPage = 0;
    document.getElementById('items-grid').innerHTML = '';
    loadMoreItems();
}

function loadMoreItems() {
    // Obliczamy zakres elementow dla aktualnej strony.
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const batch = filteredItems.slice(start, end);

    renderMarketItems(batch, true); // true = dołącz do istniejących kart
    currentPage++;

    // Pokaż/ukryj przycisk "Załaduj więcej"
    const btn = document.getElementById('load-more-btn');
    if (btn) {
        btn.classList.toggle('hidden', currentPage * PAGE_SIZE >= filteredItems.length);
    }
}

// PORTFEL: ZAPIS W LOCALSTORAGE
function getPortfolio() {
    try {
        // localStorage przechowuje tekst, dlatego odczytujemy go przez JSON.parse.
        return JSON.parse(localStorage.getItem('bazaar_portfolio')) || [];
    } catch {
        // Jesli zapis w przegladarce jest uszkodzony, zaczynamy od pustego portfela.
        return [];
    }
}

function savePortfolio(portfolio) {
    // JSON.stringify zamienia tablice portfela na tekst do zapisania.
    localStorage.setItem('bazaar_portfolio', JSON.stringify(portfolio));
}

function addToPortfolio(productId, quantity) {
    const portfolio = getPortfolio();
    // Szukamy, czy taki przedmiot jest juz zapisany.
    const existing = portfolio.find(p => p.productId === productId);
    if (existing) {
        // Jesli jest, zwiekszamy tylko ilosc.
        existing.quantity += quantity;
    } else {
        // Jesli nie ma, dodajemy nowy wpis.
        portfolio.push({ productId, quantity });
    }
    savePortfolio(portfolio);
}

function removeFromPortfolio(productId) {
    const portfolio = getPortfolio().filter(p => p.productId !== productId);
    savePortfolio(portfolio);
    refreshPortfolioView();
}

function refreshPortfolioView() {
    const portfolio = getPortfolio();
    // Laczymy zapisane ilosci z aktualnymi cenami pobranymi z API.
    const enriched = portfolio.map(entry => {
        const item = allItems.find(i => i.product_id === entry.productId);
        return {
            ...entry,
            buyPrice: item?.quick_status?.buyPrice || 0,
            sellPrice: item?.quick_status?.sellPrice || 0,
        };
    });
    renderPortfolio(enriched, removeFromPortfolio);
}

// WALIDACJA FORMULARZA PORTFELA
function validatePortfolioForm() {
    let valid = true;

    const itemSelect = document.getElementById('item-select');
    const itemError = document.getElementById('item-error');
    if (!itemSelect.value) {
        itemError.textContent = 'Wybierz przedmiot z listy.';
        valid = false;
    } else {
        itemError.textContent = '';
    }

    const qtyInput = document.getElementById('item-quantity');
    const qtyError = document.getElementById('quantity-error');
    const qty = parseInt(qtyInput.value, 10);
    if (!qtyInput.value || isNaN(qty) || qty < 1) {
        qtyError.textContent = 'Podaj ilość większą niż 0.';
        valid = false;
    } else {
        qtyError.textContent = '';
    }

    return valid;
}

// INICJALIZACJA APLIKACJI
async function initApp() {
    showLoader(true);
    showError(false);

    // Pobieramy jednocześnie dane bazaaru i materiały przedmiotów (2 zapytania do API)
    const [bazaarData, materialMap] = await Promise.all([
        fetchBazaarData(),
        fetchItemMaterials()
    ]);

    // Przekazujemy mapę materiałów do modułu ui.js
    setMaterialMap(materialMap);

    showLoader(false);

    if (!bazaarData || !bazaarData.success) {
        // Bez danych z bazaaru nie da sie zbudowac glownego widoku.
        showError(true);
        return;
    }

    // API zwraca obiekt produktow, a aplikacji wygodniej pracowac na tablicy.
    allItems = Object.values(bazaarData.products);

    // Wypełnienie selecta w portfelu
    const itemSelect = document.getElementById('item-select');
    if (itemSelect) {
        allItems.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.product_id;
            opt.textContent = formatItemName(item.product_id);
            itemSelect.appendChild(opt);
        });
    }

    applyFiltersAndSort();

    // EVENTY: NAWIGACJA
    document.getElementById('nav-market')?.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        document.getElementById('nav-market').classList.add('active');
        showView('view-market');
    });

    document.getElementById('nav-portfolio')?.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        document.getElementById('nav-portfolio').classList.add('active');
        refreshPortfolioView();
        showView('view-portfolio');
    });

    // EVENTY: RYNEK
    document.getElementById('search-input')?.addEventListener('input', applyFiltersAndSort);
    document.getElementById('sort-select')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('load-more-btn')?.addEventListener('click', loadMoreItems);

    // Delegacja zdarzeń dla przycisków "Zobacz szczegóły"
    document.getElementById('items-grid')?.addEventListener('click', (e) => {
        // closest pozwala kliknac np. tekst w przycisku, a i tak znalezc przycisk.
        const btn = e.target.closest('.details-btn');
        if (!btn) return;
        // data-id przechowuje ID produktu przypisane do kliknietej karty.
        const productId = btn.dataset.id;
        const item = allItems.find(i => i.product_id === productId);
        if (item) {
            renderItemDetails(item);
            showView('view-details');
        }
    });

    document.getElementById('back-to-market-btn')?.addEventListener('click', () => {
        showView('view-market');
    });

    // EVENTY: PORTFEL (FORMULARZ)
    document.getElementById('portfolio-form')?.addEventListener('submit', (e) => {
        // Zatrzymujemy standardowe wyslanie formularza i przeladowanie strony.
        e.preventDefault();
        if (!validatePortfolioForm()) return;

        const productId = document.getElementById('item-select').value;
        const quantity = parseInt(document.getElementById('item-quantity').value, 10);

        addToPortfolio(productId, quantity);
        refreshPortfolioView();

        document.getElementById('item-select').value = '';
        document.getElementById('item-quantity').value = '';
    });
}

document.addEventListener('DOMContentLoaded', initApp);
