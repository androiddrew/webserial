
const scrollableElement = document.getElementById('scrollable-element');
const autoscrollCheckbox = document.getElementById('autoscroll-checkbox');
const clearButton = document.getElementById('clear-button');
const refreshPorts = document.getElementById('refresh-ports');
const select = document.getElementById('serial-select');
let autoscroll = true;


refreshPorts.addEventListener('click', async () => {
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    ports = await navigator.serial.getPorts();
    console.log(ports)
    ports.forEach(port => {
        const option = document.createElement('option');
        option.value = port;
        const { usbVendorId, usbProductId } = port.getInfo();
        option.text = `Device ${usbVendorId}:${usbProductId}`;
        select.appendChild(option);
    });
});

autoscrollCheckbox.addEventListener('change', (e) => {
    autoscroll = e.target.checked;
    if (autoscroll) {
        scrollToBottom();
    }
});

clearButton.addEventListener('click', () => {
    while (scrollableElement.firstChild) {
        scrollableElement.removeChild(scrollableElement.firstChild);
    }
});

function addText() {
    const newText = document.createElement('p');
    newText.textContent = `New text added at ${new Date().toLocaleTimeString()}`;
    scrollableElement.appendChild(newText);

    if (autoscroll) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    scrollableElement.scrollTop = scrollableElement.scrollHeight;
}


async function updateSerialSelect(ports) {
    const select = document.getElementById('serial-select');
    // Clear existing options
    select.innerHTML = '<option value="">Select a device...</option>';
    
    ports.forEach(port => {
        const option = document.createElement('option');
        option.value = port;
        option.text = `Serial device`;
        select.appendChild(option);
    });
}

// Simulate adding text every 2 seconds
setInterval(addText, 2000);
