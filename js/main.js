import { fetchBazaarData } from './api.js';
import { renderMarketItems } from './ui.js';

async function initApp() {
    console.log("Pobieranie danych z API....");
    
    // Pobieramy dane
    const bazaarData = await fetchBazaarData();
    
    if (bazaarData && bazaarData.success) {
        // zamiana danych na tablice
        const itemsArray = Object.values(bazaarData.products);
        
        const first20Items = itemsArray.slice(0, 20);
        
        // pierwsze 20 itemow
        renderMarketItems(first20Items);
        
        console.log("Wyrenderowano przedmioty!");
    } else {
        console.error("Błąd ładowania danych.");
    }
}

document.addEventListener('DOMContentLoaded', initApp);