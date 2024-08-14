import * as globals from './globals.js';

export function onPortConnect() {
    globals.connectButton.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'focus:ring-emerald-500');
    globals.connectButton.classList.add('bg-red-500', 'hover:bg-red-600', 'focus:ring-red-500');
    globals.connectButton.textContent = 'Disconnect';
}

export function onPortDisconnect() {
    globals.connectButton.classList.remove('bg-red-500', 'hover:bg-red-600', 'focus:ring-red-500');
    globals.connectButton.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'focus:ring-emerald-500');
    globals.connectButton.textContent = 'Connect';
}

export function buildPortOption(port) {
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

export function addText(text) {
    const newText = document.createElement('p');
    newText.textContent = `${new Date().toLocaleTimeString()} ${text}`;
    globals.scrollableElement.appendChild(newText);

    if (globals.autoscroll) {
        scrollToBottom();
    }
}

export function scrollToBottom() {
    globals.scrollableElement.scrollTop = globals.scrollableElement.scrollHeight;
}

export async function updateSerialSelect(ports) {
    if (ports.length < 1) {
        const option = document.createElement('option');
        option.text = globals.addDeviceMessage;
        globals.select.innerHTML = ''
        globals.select.appendChild(option)
        return;
    }
    globals.select.innerHTML = ''
    ports.forEach(port => {
        const option = buildPortOption(port)
        globals.select.appendChild(option);
    });
}