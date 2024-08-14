export const addDeviceMessage = `Add a device...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
export const addPort = document.getElementById('add-port');
export const autoscrollCheckbox = document.getElementById('autoscroll-checkbox');
export const baud = document.getElementById('baud');
export const clearButton = document.getElementById('clear-button');
export const connectButton = document.getElementById('connect-button');
export const refreshPorts = document.getElementById('refresh-ports');
export const scrollableElement = document.getElementById('scrollable-element');
export const select = document.getElementById('serial-select');
export const transmitInput = document.querySelector('div[contenteditable="true"]');
export const transmitButton = document.getElementById('transmit-button');
export const uPyKeyboardInterrupt = new Uint8Array([13, 3, 3]);

export let controller;
export let isPortConnected = false;
export let autoscroll = true;
export let serialPorts = [];
export let encoder;
export let reader;
export let writer;

export function setController(newController) {
    controller = newController
}

export function setPortConnected(isConnected) {
    isPortConnected = isConnected;
}

export function setAutoscroll(isSet) {
    autoscroll = isSet;
    console.log('Set autoscroll: ', autoscroll)
}

export function setSerialPorts(ports) {
    serialPorts = ports
    console.log('Set ports: ', serialPorts)
}

export function getEncoder() {
    return encoder;
}

export function setEncoder(newEncoder) {
    encoder = newEncoder;
}

export function getReader() {
    return reader;
}

export function setReader(newReader) {
    reader = newReader;
}

export function getWriter() {
    return writer;
}

export function setWriter(newWriter) {
    writer = newWriter;
}

// expose some globals for debuggin in webconsole
if (typeof window !== 'undefined') {
    window.wsc = {
        get isPortConnected() { return isPortConnected; },
        get autoscroll() { return autoscroll; },
        get serialPorts() { return serialPorts; },
        get reader() { return reader; },
        get writer() { return writer; }
    };
}