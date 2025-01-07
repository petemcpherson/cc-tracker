// Utility function to format large numbers
function formatLargeNumber(num) {
    const illions = [
        "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
        "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
        "Decillion", "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion",
        "Quindecillion", "Sexdecillion", "Septendecillion", "Octodecillion", "Novemdecillion",
        "Vigintillion"
    ];

    if (num < 1000) {
        return num.toFixed(1); // No suffix for small numbers
    }

    let index = 0;
    while (num >= 1000 && index < illions.length - 1) {
        num /= 1000;
        index++;
    }

    return `${num.toFixed(1)} ${illions[index]}`;
}


document.addEventListener("DOMContentLoaded", () => {
    const cpmElement = document.getElementById("cpm");
    const upgradeElement = document.createElement("div");
    upgradeElement.id = "get-lucky-status";
    upgradeElement.textContent = "Checking 'Get Lucky' status...";
    document.body.appendChild(upgradeElement);

    console.log("DOM fully loaded and parsed");

    const fetchCPM = async () => {
        console.log("fetchCPM function started");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log("Tab URL:", tab.url);

            // Inject external script into the page
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const script = document.createElement("script");
                    script.src = chrome.runtime.getURL("inject.js");
                    script.onload = () => script.remove(); // Clean up
                    document.body.appendChild(script);
                },
            });

            // Listen for the combined custom event to retrieve both cookies per second and 'Get Lucky' status
            const [{ result: gameData }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return new Promise((resolve) => {
                        const handler = (event) => {
                            window.removeEventListener("GameDataRetrieved", handler);
                            resolve(event.detail);
                        };
                        window.addEventListener("GameDataRetrieved", handler);
                    });
                },
            });

            console.log("Game data retrieved:", gameData);

            if (gameData.cookiesPerSecond !== null) {
                const multiplier = gameData.hasGetLucky ? 42000 : 6000;
                const cpm = gameData.cookiesPerSecond * multiplier;
                // console.log("Calculated CPM:", cpm);

                const formattedCpm = formatLargeNumber(cpm); // Format the CPM
                // console.log("Formatted CPM:", formattedCpm);

                cpmElement.textContent = `CPM: ${formattedCpm} cookies`; // Display the formatted CPM
            } else {
                console.log("Could not retrieve cookies per second.");
                cpmElement.textContent = "Could not retrieve cookies per second.";
            }

            upgradeElement.textContent = `Get Lucky: ${gameData.hasGetLucky ? "yes" : "no"}`;

        } catch (error) {
            console.error("Error fetching CPM or 'Get Lucky' status:", error);
            cpmElement.textContent = "Error calculating CPM.";
            upgradeElement.textContent = "Error checking 'Get Lucky' status.";
        }
    };

    // Automatically fetch CPM and 'Get Lucky' status when the popup loads
    fetchCPM();
});
