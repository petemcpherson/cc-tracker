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

            // Listen for the custom event to retrieve cookiesPerSecond
            const [{ result }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return new Promise((resolve) => {
                        const handler = (event) => {
                            window.removeEventListener("CookiesPsRetrieved", handler);
                            resolve(event.detail.cookiesPerSecond);
                        };
                        window.addEventListener("CookiesPsRetrieved", handler);
                    });
                },
            });

            console.log("Cookies per second retrieved:", result);

            if (result !== null) {
                const cpm = result * 6000;
                console.log("Calculated CPM:", cpm);

                const formattedCpm = formatLargeNumber(cpm); // Format the CPM
                console.log("Formatted CPM:", formattedCpm);

                cpmElement.textContent = `CPM: ${formattedCpm} cookies`; // Display the formatted CPM
            } else {
                console.log("Could not retrieve cookies per second.");
                cpmElement.textContent = "Could not retrieve cookies per second.";
            }
        } catch (error) {
            console.error("Error fetching CPM:", error);
            cpmElement.textContent = "Error calculating CPM.";
        }
    };

    // Automatically fetch CPM when the popup loads
    fetchCPM();
});
