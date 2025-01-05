(() => {
    try {
        if (typeof Game !== "undefined" && Game.cookiesPs) {
            console.log("Injected script: Game.cookiesPs =", Game.cookiesPs);

            // Dispatch a custom event with Game.cookiesPs
            const event = new CustomEvent("CookiesPsRetrieved", {
                detail: { cookiesPerSecond: Game.cookiesPs },
            });
            window.dispatchEvent(event);
        } else {
            console.log("Game is not defined.");
        }
    } catch (error) {
        console.error("Error in injected script:", error);
    }
})();
