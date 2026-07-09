import sounddevice as sd
import soundfile, math, time, os
import numpy as np
import python_stretch as ps
from application_classes.Settings import SettingsClass





class AudioEngine:

    def __init__(self,c):
        sd.default.device = (None, "CABLE Input (VB-Audio Virtual C, MME")

        self.settings_data = SettingsClass()

        self.triangle_timer = 0
        self.sine_timer = 0

        self.stretch = ps.Signalsmith.Stretch()
        self.default_sr = sd.query_devices(kind="input")["default_samplerate"]

        self.current_audio = None
        self.audio_pointer = 0

        self.current_tts_track = None
        self.current_tts_pointer = 0
        with sd.Stream(samplerate=self.default_sr, channels=1, blocksize=8192, callback=self.callback):

            try:
                while True:
                    if(c.poll()):
                        data = c.recv()
                        if(data["type"] == "setting_change"):
                            self.settings_data.config[data["setting"]] = data["value"]

                        if(data["type"] == "play_audio"):
                            if(not os.path.exists(f"sound_files/{data["audio_name"]}.wav")):
                                continue

                            y, sr = soundfile.read(file=f"sound_files/{data["audio_name"]}.wav", always_2d=True)
                            if(y.shape[1] > 1):
                                y = y.mean(axis=1)
                                y = y[:,np.newaxis]

                            self.audio_pointer = 0
                            self.current_audio = y

                        if(data["type"] == "stop_audio"):
                            self.audio_pointer = 0
                            self.current_audio = None

                        if(data["type"] == "board_setting_change"):
                            self.settings_data.sb_config[data["setting"]] = data["value"]

                        if(data["type"] == "tts"):
                            if(not os.path.exists("tts_temp/audio.wav")):
                                continue
                            
                            y, sr = soundfile.read(file="tts_temp/audio.wav", always_2d=True)
                            if(y.shape[1] > 1):
                                y = y.mean(axis=1)
                                y = y[:,np.newaxis]

                            self.current_tts_pointer = 0
                            self.current_tts_track = y
                        
                        if(data["type"] == "stop_tts"):
                            self.current_tts_pointer = 0
                            self.current_tts_track = None

                        if(data["type"] == "toggle_mod"):
                            if(data["mod_type"] == "sine"):
                                self.settings_data.sine_config["active"] = data["value"]
                            
                            if(data["mod_type"] == "triangular"):
                                self.settings_data.triangle_config["active"] = data["value"]

                        if(data["type"] == "freq_change"):
                            if(data["mod_type"] == "sine"):
                                self.settings_data.sine_config["frequency"] = data["value"]

                            if(data["mod_type"] == "triangular"):
                                self.settings_data.triangle_config["frequency"] = data["value"]
                        
                        if(data["type"] == "tts_settings"):
                            self.settings_data.tts_config[data["setting"]] = data["value"]

                        
                    time.sleep(0.1)
            except:
                print("stopped")
        
    
    def callback(self, indata, outdata , frames, t, status):
        indatanew = self.pitch_shift_array(indata, self.settings_data.config["semitone"]) * self.settings_data.config["volume"]
        
        if(self.current_audio is not None):
            audio_chunk = self.sounboard_array(frames=frames)
            indatanew = ((indatanew * 0.75) + (audio_chunk * 0.25))
        
        if(self.current_tts_track is not None):
            tts_audio_chunk = self.tts_array(frames=frames)
            indatanew = ((indatanew * 0.75) + (tts_audio_chunk * 0.25))

        if(self.settings_data.sine_config["active"]):
            indatanew = self.sine_modulation(input_chunk=indatanew, frames=frames)

        if(self.settings_data.triangle_config["active"]):
            indatanew = self.triangle_modulation(input_chunk=indatanew, frames=frames)
        
        indatanew[:64] *= np.linspace(0.0,1.0,64)[:,np.newaxis]
        indatanew[-64:] *= np.linspace(1.0,0.0,64)[:,np.newaxis]

        indatanew = np.clip(indatanew, -1, 1)
        outdata[:] = indatanew

    def pitch_shift_array(self, data, semitone):
        data = data.T
        self.stretch.preset(data.shape[0],self.default_sr,cheaper=False)
        self.stretch.setTransposeSemitones( semitone )
        indatanew = self.stretch.process(data).T
        return indatanew

    def sounboard_array(self, frames):
        chunk_frames = frames
        if((self.audio_pointer + chunk_frames) > len(self.current_audio)):
            chunk_frames = len(self.current_audio) - self.audio_pointer
        
        audio_chunk = self.current_audio[self.audio_pointer : self.audio_pointer+chunk_frames]

        if(len(audio_chunk) < frames):
            width_to_pad = frames - len(audio_chunk)
            audio_chunk = np.pad(audio_chunk, pad_width=((0, width_to_pad),(0,0)), mode="constant", constant_values=0)
            self.current_audio = None
            self.audio_pointer = 0
        else:
            self.audio_pointer += frames

        audio_chunk = self.pitch_shift_array(audio_chunk, self.settings_data.sb_config["semitone"]) * self.settings_data.sb_config["volume"]

        
        return audio_chunk
    
    def tts_array(self, frames):
        tts_chunk_frames = frames
        if((self.current_tts_pointer + tts_chunk_frames) > len(self.current_tts_track)):
            tts_chunk_frames = len(self.current_tts_track) - self.audio_pointer
        
        tts_audio_chunk = self.current_tts_track[self.current_tts_pointer : self.current_tts_pointer+tts_chunk_frames]

        if(len(tts_audio_chunk) < frames):
            width_to_pad = frames - len(tts_audio_chunk)
            tts_audio_chunk = np.pad(tts_audio_chunk, pad_width=((0, width_to_pad),(0,0)), mode="constant", constant_values=0)
            self.current_tts_track = None
            self.current_tts_pointer = 0
        else:
            self.current_tts_pointer += frames

        tts_audio_chunk = self.pitch_shift_array(tts_audio_chunk, self.settings_data.tts_config["semitone"]) * self.settings_data.tts_config["volume"]

        return tts_audio_chunk
    
    def sine_modulation(self, input_chunk, frames):
        t_add = frames / self.default_sr
        if(self.sine_timer + t_add > (math.pi * 2)):
            self.sine_timer = 0
        else:
            self.sine_timer += t_add
        
        input_chunk = self.pitch_shift_array(input_chunk, 12 * math.sin(self.sine_timer * self.settings_data.sine_config["frequency"]))
        return input_chunk
        


    def triangle_modulation(self, input_chunk, frames):
        t_add = frames / self.default_sr
        if(self.triangle_timer + t_add > (math.pi * 2)):
            self.triangle_timer = 0
        else:
            self.triangle_timer += t_add
        
        input_chunk = self.pitch_shift_array(input_chunk, (12*(2/math.pi)) * math.asin(math.cos(self.triangle_timer * self.settings_data.triangle_config["frequency"])))
        return input_chunk
        