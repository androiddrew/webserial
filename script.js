
const scrollableElement = document.getElementById('scrollable-element');
const autoscrollCheckbox = document.getElementById('autoscroll-checkbox');
const connectButton = document.getElementById('connect-button')
const clearButton = document.getElementById('clear-button');
const addPort = document.getElementById('add-port')
const refreshPorts = document.getElementById('refresh-ports');
const select = document.getElementById('serial-select');
const baud = document.getElementById('baud');
let autoscroll = true;
let serialPorts = [];
let reader;

addPort.addEventListener('click', async () => {
    const port = await navigator.serial.requestPort();
    serialPorts.push(port);
    updateSerialSelect(serialPorts);
});

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

async function updateSerialSelect(ports) {
    if (ports > 0) {
        select.innerHTML = '<option value="">Add a device...</option>';
    } else {
        select.innerHTML = '<option value="">Select a device...</option>';
    }
    ports.forEach(port => {
        const option = buildPortOption(port)
        select.appendChild(option);
    });
}

connectButton.addEventListener('click', async () => {
    const selectedPort = serialPorts[select.selectedIndex - 1]
    const baudRate = Math.round(baud.value)
    if (selectedPort) {
        await connectToSerialPort(selectedPort, baudRate);
    }
});

async function connectToSerialPort(port, baud) {
    await port.open({ baudRate: baud });

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            addText(value);
        }
    } catch (error) {
        console.error('Error reading data from serial port:', error);
    } finally {
        reader.releaseLock();
        await readableStreamClosed.catch(() => { });
        await port.close();
    }
}



// Simulate adding text every 2 seconds
// setInterval(addText, 2000);
