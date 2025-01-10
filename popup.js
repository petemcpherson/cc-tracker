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
    const appElement = document.getElementById("app");
    
    const renderTemplate = (template, data) => {
        return template.replace(/\${(\w+)}/g, (match, key) => data[key] || '');
    };

    const updateUI = (templateData) => {
        const template = document.getElementById('stats-template').innerHTML;
        appElement.innerHTML = renderTemplate(template, templateData);
    };

    const fetchCPM = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Inject external script into the page
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const script = document.createElement("script");
                    script.src = chrome.runtime.getURL("inject.js");
                    script.onload = () => script.remove();
                    document.body.appendChild(script);
                },
            });

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

            if (gameData.cookiesPerSecond !== null) {
                const multiplier = gameData.hasGetLucky ? 42000 : 6000;
                const cpm = gameData.cookiesPerSecond * multiplier;
                const maxLuckyMultiplier = gameData.hasGetLucky ? 6300 : 900;
                const maxLucky = gameData.cookiesPerSecond * maxLuckyMultiplier;
                const multipliedCPS = gameData.cookiesPerSecond * multiplier;
                const difference = Math.abs(multipliedCPS - gameData.currentBank);

                const conjureBank = (gameData.cookiesPerSecond * 12600) / 0.15;

                updateUI({
                    idealBank: formatLargeNumber(cpm),
                    idealBankConjure: formatLargeNumber(conjureBank),
                    maxLucky: formatLargeNumber(maxLucky),
                    bankStatus: gameData.currentBank < multipliedCPS 
                        ? `You should bank ${formatLargeNumber(difference)} more cookies`
                        : `${formatLargeNumber(difference)} available to spend!`,
                    getLuckyStatus: gameData.hasGetLucky ? "yes" : "no"
                });
            } else {
                updateUI({
                    idealBank: "Could not retrieve cookies per second.",
                    idealBankConjure: "Could not calculate Conjure bank.",
                    maxLucky: "Could not calculate Max Lucky.",
                    bankStatus: "Could not calculate bank status.",
                    getLuckyStatus: "unknown"
                });
            }
        } catch (error) {
            console.error("Error fetching CPM or 'Get Lucky' status:", error);
            updateUI({
                idealBank: "Error calculating CPM.",
                idealBankConjure: "Error calculating Conjure bank.",
                maxLucky: "Error calculating Max Lucky.",
                bankStatus: "Error calculating bank status.",
                getLuckyStatus: "Error checking status"
            });
        }
    };

    fetchCPM();
});
