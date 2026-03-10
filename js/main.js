// Import funkcji pobierającej dane
import { fetchBazaarData } from './api.js';

// Główna funkcja inicjalizująca aplikację
async function initApp() {
    console.log("Czekam na dane z Hypixela....");
    
    // Wywołujemy pobieranie danych i czekamy na wynik
    const bazaarData = await fetchBazaarData();
    
    // Sprawdzamy, czy dane wróciły i czy API potwierdza sukces
    if (bazaarData && bazaarData.success) {
        console.log("Sukces! Pobrano dane z Bazaaru.");
        
        // Dane o przedmiotach są ukryte w obiekcie 'products'
        console.log("Lista przedmiotów:", bazaarData.products);
        
        // Podejrzyjmy szczegóły jednego konkretnego przedmiotu, np. diamentu
        if (bazaarData.products.DIAMOND) {
            console.log("Szczegóły Diamentu:", bazaarData.products.DIAMOND);
        }
        
    } else {
        console.error("Nie udało się załadować danych do aplikacji.");
        // W przyszłości tutaj pokażemy użytkownikowi czerwony pasek z błędem z index.html
    }
}

// Uruchamiamy initApp dopiero, gdy cała struktura HTML zostanie załadowana
document.addEventListener('DOMContentLoaded', initApp);