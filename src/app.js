import * as globals from './globals.js';
import { setupEventListeners } from './eventListeners.js';
import { updateSerialSelect } from './uiHelpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ports = await navigator.serial.getPorts();
    globals.setSerialPorts(ports);
    updateSerialSelect(ports);
    setupEventListeners();
});