const CONFIG = {
    divName: "ixjb94_quantity",
    localStorage: "ixjb94_quantity_divPosition",
    localStoragePopup: "ixjb94_quantity_popup",
    css: "_ixjb94_quantity",
}

// styles
const styles = document.createElement("style")
styles.innerHTML = `
.draggableDiv${CONFIG.css} {
    position: fixed;
    z-index: 9999;
    border: 1px solid #000;
    cursor: move;
    font-family: monospace;
    user-select: none;
    background: white;
}
.red${CONFIG.css} {
    color: red;
}
.results${CONFIG.css} {
    margin-bottom: 5px;
    background: #1b85d9;
    color: white;
    text-align: left;
    padding: 5px;
}
.stopLoss${CONFIG.css} {
    border-radius: 0px;
    border: 1px solid;
    font-size: 12px;
    outline: unset;
    font-family: monospace;
    border-color: #999;
    margin: 5px;
    padding: 5px;
    color: black;
    background: white;
}
.mt5${CONFIG.css} {
    margin-top: 5px;
}
.calc${CONFIG.css} {
    background: #1b85d9;
    color: white;
    font-size: 10px;
    border: unset;
    font-family: monospace;
    cursor: pointer;
    width: 100%;
    padding: 5px;
}
.stopLoss${CONFIG.css}::selection {
    background: #1b85d9;
    color: white;
}
`
document.body.appendChild(styles)

// main element
const draggableDiv = document.createElement("div");
draggableDiv.id = CONFIG.divName;
draggableDiv.className = `draggableDiv${CONFIG.css}`;
draggableDiv.innerHTML = `
    <div class="results${CONFIG.css}">Quantity: $0 (0%)</div>
    <div class="content${CONFIG.css}">
        <input id="stopLoss${CONFIG.css}" class="stopLoss${CONFIG.css}" type="text" placeholder="Stop Loss %" />
        <div class="mt5">
            <button id="calculate${CONFIG.css}" class="calc${CONFIG.css}"> Calculate </button>
        </div>
    </div>
`
document.body.appendChild(draggableDiv);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.message) {
        let {
            accountSize, leverage,
            maxLoss, fee,
        } = request.message

        accountSize = Number(accountSize)
        leverage = Number(leverage)
        maxLoss = Number(maxLoss)
        fee     = Number(fee)

        localStorage.setItem(CONFIG.localStoragePopup, JSON.stringify({accountSize, leverage, maxLoss, fee}))

        // recalculate in case
        calculate()
    }
});

const savedPosition = localStorage.getItem(CONFIG.localStorage);
if (savedPosition) {
    const { top, left } = JSON.parse(savedPosition);
    draggableDiv.style.top = `${top}px`;
    draggableDiv.style.left = `${left}px`;
} else {
    // Default position
    draggableDiv.style.top = "10px";
    draggableDiv.style.left = "10px";
}

document.body.appendChild(draggableDiv);

let isDragging = false;
let offsetX, offsetY;

draggableDiv.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - draggableDiv.offsetLeft;
    offsetY = event.clientY - draggableDiv.offsetTop;
    draggableDiv.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;
        draggableDiv.style.left = `${newLeft}px`;
        draggableDiv.style.top = `${newTop}px`;
    }
});

document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        draggableDiv.style.cursor = "move";

        // Save the position to localStorage
        const position = {
            top: parseInt(draggableDiv.style.top, 10),
            left: parseInt(draggableDiv.style.left, 10),
        };

        localStorage.setItem(CONFIG.localStorage, JSON.stringify(position));
    }
});

/**
 * @returns Calculate Quantity
 */
function quantity() {
    const stopLossInput = document.getElementById(`stopLoss${CONFIG.css}`)
    const stopLoss = Number(stopLossInput.value)
    
    let accountSize = 100;
    let leverage = 10;
    let maxLoss = 1;
    let fee = 0;
    
    let LS = localStorage.getItem(CONFIG.localStoragePopup)

    if (LS) {
        LS = JSON.parse(LS)
        accountSize = LS.accountSize
        leverage = LS.leverage
        maxLoss = LS.maxLoss
        fee = LS.fee
    }
    
    const bads = Number(stopLoss) + Number(fee)

    /**
     * Q = (R * A) / (SL * L)
     * Q = Quantity
     * R = Risk %
     * A = Account Size
     * SL = Stop Loss %
     * L = Leverage
     */
    const qty = ((maxLoss / 100) * accountSize) / ((bads / 100) * leverage)

    /**
     * Slider = (Quantity * 100) / (AccountSize * Leverage)
     */
    const slider = (qty * 100) / (accountSize * leverage)

    return {qty, slider}
}

function calculate() {
    const {qty, slider} = quantity();
    const resultsElement = document.querySelector(`.results${CONFIG.css}`)
    resultsElement.innerHTML = `
        Quantity: $${qty.toFixed(2)} (%${slider.toFixed(2)})
    `;
}

const calculateButton = document.getElementById(`calculate${CONFIG.css}`)
calculateButton.addEventListener("click", (event) => {
    calculate()
})

document.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        calculate()
    }
})

const stopLossInput = document.getElementById(`stopLoss${CONFIG.css}`)
stopLossInput.addEventListener("focus", () => stopLossInput.select())