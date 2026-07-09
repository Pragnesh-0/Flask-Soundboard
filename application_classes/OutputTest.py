import sounddevice as sd
import time


class OutputTest:

    def __init__(self, stop_event):
        sd.default.device = ("CABLE Output (VB-Audio Virtual , MME", None)
        self.default_sr = sd.query_devices(kind="input")["default_samplerate"]
        with sd.Stream(samplerate=self.default_sr, channels=1, blocksize=512, callback=self.callback):
            try:
                while not stop_event.is_set():
                    time.sleep(0.1)
            except:
                print("Test Stop")

    def callback(self, indata, outdata , frames, t, status):
        outdata[:] = indata