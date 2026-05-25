// URL do publicznego endpointu Bazaaru
const BAZAAR_API_URL = 'https://api.hypixel.net/v2/skyblock/bazaar';

// URL do endpointu z listą wszystkich przedmiotów SkyBlock (zawiera pole material)
const ITEMS_API_URL = 'https://api.hypixel.net/v2/resources/skyblock/items';

/**
 * Pobiera aktualne dane z rynku Hypixel SkyBlock.
 * Zwraca obiekt z danymi lub null w przypadku błędu.
 */
export async function fetchBazaarData() {
    try {
        // Wysylamy zapytanie do API z aktualnymi cenami.
        const response = await fetch(BAZAAR_API_URL);
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        // Zamieniamy odpowiedz JSON na zwykly obiekt JavaScript.
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Krytyczny błąd podczas łączenia z API:", error);
        return null;
    }
}

/**
 * Pobiera dane o wszystkich przedmiotach SkyBlock (w tym pole "material" z nazwą tekstury).
 * Zwraca mapę: { PRODUCT_ID: "MATERIAL_NAME" } lub pusty obiekt w razie błędu.
 */
export async function fetchItemMaterials() {
    try {
        // Ten endpoint sluzy tylko do pobrania informacji o ikonach/materialach.
        const response = await fetch(ITEMS_API_URL);
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        const data = await response.json();

        // Tworzymy słownik: ID -> material (np. "DIAMOND" -> "DIAMOND")
        const materialMap = {};
        if (data.items) {
            data.items.forEach(item => {
                // Pomijamy rekordy bez ID albo bez materialu.
                if (item.id && item.material) {
                    materialMap[item.id] = item.material.toLowerCase();
                }
            });
        }
        return materialMap;
    } catch (error) {
        console.error("Błąd pobierania danych o przedmiotach:", error);
        return {};
    }
}
