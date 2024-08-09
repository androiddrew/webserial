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

let isPortConnected = false;
let controller;
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
    if (!isPortConnected) {
        await connectToSerialPort(selectedPort, baudRate);
    } else {
        isPortConnected = false;
    }
});

refreshPorts.addEventListener('click', async () => {
    ports = await navigator.serial.getPorts();
    serialPorts = ports
    updateSerialSelect(ports)
});

// Functions
function onPortConnect() {
    connectButton.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'focus:ring-emerald-500');
    connectButton.classList.add('bg-red-500', 'hover:bg-red-600', 'focus:ring-red-500');
    connectButton.textContent = 'Disconnect';
}

function onPortDisconnect() {
    connectButton.classList.remove('bg-red-500', 'hover:bg-red-600', 'focus:ring-red-500');
    connectButton.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'focus:ring-emerald-500');
    connectButton.textContent = 'Connect';
}


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
    onPortConnect()

    let buffer = ''
    // The TextDecoderStream interface of the Encoding API converts a stream of text in a binary encoding,
    // such as UTF-8 etc., to a stream of strings
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    controller = new AbortController();
    const signal = controller.signal;
    try {
        isPortConnected = true;
        while (isPortConnected) {
            const { value, done } = await reader.read({ signal });
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
        controller.abort();

        reader.releaseLock();
        try {
            await textDecoder.readable.cancel();
        } catch (error) {
            console.error("Error encountered in readableStreamClosed:", error);
        }

        try {
            await readableStreamClosed;
        } catch (error) {
        }

        try {
            await port.close();
        } catch (error) {
            console.error("Error encountered closing port:", error);
        }
        onPortDisconnect()
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
    select.innerHTML = ''
    ports.forEach(port => {
        const option = buildPortOption(port)
        select.appendChild(option);
    });
}