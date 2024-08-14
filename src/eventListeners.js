import * as globals from './globals.js';
import { connectToSerialPort, transmitContents } from './serialCommunication.js';
import { scrollToBottom, updateSerialSelect, onPortDisconnect } from './uiHelpers.js';

const uPyKeyboardInterrupt = new Uint8Array([13, 3, 3]);

export function setupEventListeners() {
    globals.addPort.addEventListener('click', async () => {
        const port = await navigator.serial.requestPort();
        globals.serialPorts.push(port);
        updateSerialSelect(globals.serialPorts);
    });

    globals.autoscrollCheckbox.addEventListener('change', (e) => {
        globals.setAutoscroll(e.target.checked);
        if (globals.autoscroll) {
            scrollToBottom();
        }
    });

    globals.clearButton.addEventListener('click', () => {
        while (globals.scrollableElement.firstChild) {
            globals.scrollableElement.removeChild(globals.scrollableElement.firstChild);
        }
    });

    globals.connectButton.addEventListener('click', async () => {
        const selectedPort = globals.serialPorts[globals.select.selectedIndex];
        const baudRate = Math.round(globals.baud.value);
        if (!globals.isPortConnected) {
            console.log("selected port: ", selectedPort)
            console.log("Baud Rate: ", baudRate)
            await connectToSerialPort(selectedPort, baudRate);
        } else {
            console.log("Disconnecting from port...")
            globals.setPortConnected(false);
            globals.reader.cancel();
            onPortDisconnect();
        }
    });

    globals.refreshPorts.addEventListener('click', async () => {
        const ports = await navigator.serial.getPorts();
        console.log(ports)
        globals.setSerialPorts(ports)
        updateSerialSelect(globals.serialPorts)
    });

    globals.transmitButton.addEventListener('click', async (event) => {
        transmitContents(globals.transmitInput.innerText)
        globals.transmitInput.innerHTML = ''
    });

    globals.transmitInput.addEventListener('keydown', async (event) => {
        if (event.key === 'c' && event.ctrlKey) {
            event.preventDefault();
            console.log("Sending interrupt ", uPyKeyboardInterrupt)
            await globals.writer.write(uPyKeyboardInterrupt);
        }
    });

    globals.transmitInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            transmitContents(globals.transmitInput.innerText);
            globals.transmitInput.innerHTML = ''
        }
    });
}