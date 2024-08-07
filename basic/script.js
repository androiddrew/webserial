document.getElementById('connect').addEventListener('click', async () => {
    // Feature detection
    if ('serial' in navigator) {
        try {
            // Request a port and open a connection
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });

            // Create a text decoder to decode the bytes from the serial device
            const decoder = new TextDecoderStream();
            const inputDone = port.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable;

            // Read data from the serial device
            const reader = inputStream.getReader();
            const outputElement = document.getElementById('output');
            outputElement.textContent = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // Allow the serial port to be closed later.
                    reader.releaseLock();
                    break;
                }
                // Print the output to the webpage
                outputElement.textContent += value;
                // Scroll to the bottom as new data comes in
                outputElement.scrollTop = outputElement.scrollHeight;
            }
        } catch (error) {
            console.error('There was an error:', error);
        }
    } else {
        console.log('Web Serial API not supported in this browser.');
    }
});
