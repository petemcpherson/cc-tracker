(() => {
    try {
        if (typeof Game !== "undefined") {
            // console.log("Injected script: Game.cookiesPs =", Game.cookiesPs);
            // console.log('Game:', Game);
            // Check for 'Get Lucky' upgrade
            const getLuckyUpgrade = Game.UpgradesById[86];
            const currentBank = Game.cookies;
            const hasGetLucky = getLuckyUpgrade && getLuckyUpgrade.bought === 1;
            // console.log(`Has "Get Lucky" upgrade: ${hasGetLucky}`);

            // Dispatch a single custom event with both cookies per second and 'Get Lucky' status
            const combinedEvent = new CustomEvent("GameDataRetrieved", {
                detail: {
                    cookiesPerSecond: Game.cookiesPsRaw,
                    hasGetLucky,
                    currentBank
                },
            });
            window.dispatchEvent(combinedEvent);
        } else {
            console.log("Game is not defined.");
        }
    } catch (error) {
        console.error("Error in injected script:", error);
    }
})();
