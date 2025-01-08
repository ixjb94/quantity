const CONFIG = {
    storageName: "ixjb94_quantity_popup",
}

document.addEventListener("DOMContentLoaded", () => {
    const accountSizeInput = document.getElementById("accountSize");
    const leverageInput = document.getElementById("leverage");
    const maxLossInput = document.getElementById("maxLoss");
    const feeInput = document.getElementById("fee");
    const saveButton = document.getElementById("saveButton");

    // Load localStorage
    chrome.storage.local.get([CONFIG.storageName]).then((value) => {
        if (typeof value == "object") {
            const {
                fee, maxLoss,
                accountSize, leverage,
            } = value[CONFIG.storageName]

            accountSizeInput.value = accountSize;
            leverageInput.value = leverage;
            maxLossInput.value = maxLoss;
            feeInput.value = fee;
        }
    })

    // Save localStorage --- Send Data
    saveButton.addEventListener("click", () => {
        
        const value = {
            accountSize: accountSizeInput.value,
            leverage: leverageInput.value,
            maxLoss: maxLossInput.value,
            fee: feeInput.value,
        };
        
        chrome.storage.local.set({ [CONFIG.storageName]: value })
        
        // Send -> content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { message: value });
            }
        });
    });
});
