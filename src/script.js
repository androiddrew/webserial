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
const transmitInput = document.querySelector('div[contenteditable="true"]');
const transmitButton = document.getElementById('transmit-button');
const uPyKeyboardInterrupt = new Uint8Array([13, 3, 3])

let isPortConnected = false;
let controller;
let autoscroll = true;
let serialPorts = [];

let encoder;
let reader;
let writer;

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
        onPortDisconnect();
    }
});

refreshPorts.addEventListener('click', async () => {
    ports = await navigator.serial.getPorts();
    serialPorts = ports
    updateSerialSelect(ports)
});

transmitButton.addEventListener('click', async (event) => {
    transmitContents(transmitInput.innerText)
    transmitInput.innerHTML = ''
});

transmitInput.addEventListener('keydown', (event) => {
    if (event.key === 'c' && event.ctrlKey) {
        event.preventDefault();
        console.log("Sending interrupt ", uPyKeyboardInterrupt)
        writer.write(uPyKeyboardInterrupt);
    }
});

transmitInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        transmitContents(transmitInput.innerText);
        transmitInput.innerHTML = ''
    }
});


// Functions
function transmitContents(input) {
    encoded_string = encoder.encode(input + '\r')
    console.log("Binary Contents: ", encoded_string)
    writer.write(encoded_string)
}


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
    // const textEncoder = new TextEncoderStream();
    // const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    // writer = textEncoder.writable.getWriter();

    encoder = new TextEncoder()
    writer = port.writable.getWriter();

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    controller = new AbortController();
    const signal = controller.signal;
    try {
        isPortConnected = true;
        while (isPortConnected) {
            const { value, done } = await reader.read({ signal });
            if (done || !port.readable) {
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
        // Port cleanup
        controller.abort();
        writer.releaseLock();
        reader.releaseLock();

        // try {
        //     writer.close();
        //     await writableStreamClosed;
        // } catch (error) {
        //     console.error("Error encountered in writeableSteamClosed:", error)
        // }

        try {
            reader.cancel();
        } catch (error) {
            console.error("Error encountered in readableStreamClosed:", error);
        }

        try {
            await readableStreamClosed;
        } catch (error) {
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