import * as globals from './globals.js';
import { onPortConnect, onPortDisconnect, addText } from './uiHelpers.js';

export async function connectToSerialPort(port, baud) {
    console.log("Connecting to port: ", port);
    await port.open({ baudRate: baud });
    onPortConnect()

    let buffer = ''
    globals.setEncoder(new TextEncoder());
    globals.setWriter(port.writable.getWriter());

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    globals.setReader(textDecoder.readable.getReader());

    globals.setController(new AbortController());
    const signal = globals.controller.signal;
    try {
        globals.setPortConnected(true);
        while (globals.isPortConnected) {
            const { value, done } = await globals.reader.read({ signal });
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
        console.log("Exiting serial print loop")
    } catch (error) {
        console.error('Error reading data from serial port:', error);
    } finally {
        // Port cleanup
        console.log("Cleaning up port.")
        globals.controller.abort();
        console.log("Releasing writer lock")
        globals.writer.releaseLock();

        // Since we are using a readableSteam we should call cancel instead of globals.reader.releaseLock();
        globals.reader.cancel().then(() => {
            console.log('Stream canceled');
        }).catch(error => {
            console.error('Error canceling the stream:', error);
        });

        try {
            await readableStreamClosed;
        } catch (error) {
        }

        try {
            await port.close();
        } catch (error) {
            console.error("Error encountered closing port:", error);
        }
        console.log("Port closed.")
        onPortDisconnect()
    }
}

export function transmitContents(input) {
    const encoded_string = globals.encoder.encode(input + '\r')
    console.log("Binary Contents: ", encoded_string);
    globals.writer.write(encoded_string);
}
