// Globals
const addDeviceMessage = `Add a device...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`
const addPort = document.getElementById('add-port')
const autoscrollCheckbox = document.getElementById('autoscroll-checkbox');
const baud = document.getElementById('baud');
const clearButton = document.getElementById('clear-button');
const connectButton = document.getElementById('connect-button')
const refreshPorts = document.getElementById('refresh-ports');
const scrollableElement = document.getElementById('scrollable-element');
const select = document.getElementById('serial-select');

let autoscroll = true;
let serialPorts = [];
let reader;

// Event Listeners
addPort.addEventListener('click', async () => {
    const port = await navigator.serial.requestPort();
    serialPorts.push(port);
    updateSerialSelect(serialPorts);
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

connectButton.addEventListener('click', async () => {
    const selectedPort = serialPorts[select.selectedIndex]
    const baudRate = Math.round(baud.value)
    if (selectedPort) {
        await connectToSerialPort(selectedPort, baudRate);
    }
});

refreshPorts.addEventListener('click', async () => {
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    ports = await navigator.serial.getPorts();

    console.log(ports)
    ports.forEach(port => {
        const option = buildPortOption(port)
        select.appendChild(option);
    });
});

// Functions
function buildPortOption(port) {
    const option = document.createElement('option');
    option.value = port;

    try {
        const info = port.getInfo();
        if (info && 'usbVendorId' in info && 'usbProductId' in info) {
            const { usbVendorId, usbProductId } = info;
            option.text = `Device ${usbVendorId}:${usbProductId}`;
        } else {
            console.error('getInfo() did not return expected properties:', info);
            option.text = 'Unknown Device';
        }
    } catch (error) {
        console.error('Error retrieving port information:', error);
        option.text = 'Unknown Device';
    }

    return option;
}

function addText(text) {
    const newText = document.createElement('p');
    newText.textContent = `${new Date().toLocaleTimeString()} ${text}`;
    scrollableElement.appendChild(newText);

    if (autoscroll) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    scrollableElement.scrollTop = scrollableElement.scrollHeight;
}

// Async Functions
async function connectToSerialPort(port, baud) {
    await port.open({ baudRate: baud });
    let buffer = ''
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            buffer += value;

            while (buffer.includes('\n')) {
                const newlineIndex = buffer.indexOf('\n');
                const line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);

                addText(line);
            }
        }
    } catch (error) {
        console.error('Error reading data from serial port:', error);
    } finally {
        reader.releaseLock();
        await readableStreamClosed.catch(() => { });
        await port.close();
    }
}

async function updateSerialSelect(ports) {
    if (ports.length < 1) {
        const option = document.createElement('option');
        option.text = addDeviceMessage;
        select.innerHTML = ''
        select.appendChild(option)
        return;
    }
    ports.forEach(port => {
        const option = buildPortOption(port)
        select.appendChild(option);
    });
    select.removeChild(select.firstElementChild);
}