import time
from machine import UART

# Initialize UART1 (or any other UART you want to use). These pins are for UART1 on ESP-32 S3 Devkit
uart1 = UART(1, baudrate=115200, tx=17, rx=18)

counter = 0

while True:
    if uart1.any():
        print(uart1.read())
    print("I'm still here. Count {}".format(counter))
    counter += 1
    time.sleep(1)
