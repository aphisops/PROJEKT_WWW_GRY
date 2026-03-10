// URL do publicznego endpointu Bazaaru 
const BAZAAR_API_URL = 'https://api.hypixel.net/v2/skyblock/bazaar';

/**
 * Pobiera aktualne dane z rynku Hypixel SkyBlock.
 * Zwraca obiekt z danymi lub null w przypadku błędu.
 */
export async function fetchBazaarData() {
    try {
        const response = await fetch(BAZAAR_API_URL);
        
        // Sprawdzamy, czy odpowiedź serwera jest prawidłowa (status 200-299)
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        // Przetwarzamy odpowiedź na obiekt JavaScript
        const data = await response.json();
        return data;
        
    } catch (error) {
        // Jeśli nie ma internetu lub serwer Hypixela nie odpowiada
        console.error("Krytyczny błąd podczas łączenia z API:", error);
        return null; 
    }
}