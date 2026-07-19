import multiprocessing
import time,os
from flask import Flask, request ,send_from_directory
from application_classes.Settings import SettingsClass
import pyttsx3
from application_classes.OutputTest import OutputTest

#change to whatever transformer or library, must be saved in tts_temp as .wav
def create_tts(text, p):
    pytts = pyttsx3.init()
    voices = pytts.getProperty("voices")
    pytts.setProperty("voice", voices[int(os.environ.get("VOICE", 0))].id)
    pytts.setProperty("rate", 75)
    pytts.save_to_file(text=text, filename="tts_temp/audio.wav")
    pytts.runAndWait()
    p.send({"type":"tts"})


def create_test_stream(stop_event):
    OutputTest(stop_event=stop_event)

class FlaskApp:

    def __init__(self,p):
        self.app = Flask(__name__, static_folder="../dist", static_url_path="/")
        self.set_endpoints()
        self.p = p
        self.audio_db = time.perf_counter_ns()
        self.tts_db = time.perf_counter_ns()
        self.tts_process = None
        self.test_db = time.perf_counter_ns()
        self.test_process = None
        self.stop_test_event = multiprocessing.Event()
        self.settings_data = SettingsClass()
        


    def set_endpoints(self):
        @self.app.route("/")
        def index():
            return send_from_directory(self.app.static_folder, "index.html")
        

        @self.app.route("/favicon.svg")
        def favicon():
            return send_from_directory(self.app.static_folder,"favicon.svg")


        @self.app.post("/api/set_settings")
        def set_data():

            data = request.get_json()
            
            if "setting" in data:
                self.p.send({"type":"setting_change", "setting":data["setting"], "value":data["value"]})
                self.settings_data.config[data["setting"]] = data["value"]
            else:
                return {"success":False}

            return {"success":True}
        
        @self.app.post("/api/set_board_settings")
        def set_board_data():

            data = request.get_json()

            if "setting" in data:
                self.p.send({"type":"board_setting_change", "setting":data["setting"], "value":data["value"]})
                self.settings_data.sb_config[data["setting"]] = data["value"]
            else:
                return {"success":False}

            return {"success":True}
        
        @self.app.post("/api/play_audio")
        def play_audio():
            data = request.get_json()

            if(self.audio_db > time.perf_counter_ns()):
                return {"success":False}
            else:
                self.audio_db = time.perf_counter_ns() + 50000000
            

            if "value" in data:
                
                self.p.send({"type":"play_audio", "audio_name":data["value"]})
                

            return {"success":True}

        @self.app.get("/api/get_audios")
        def get_audios():
            audios = os.listdir("sound_files")
            audio_name_list = []
            for audio in audios:
                audio_name_list.append(audio.removesuffix(".wav"))
            
            return audio_name_list

        @self.app.post("/api/stop_audio")
        def stop_audio():
            self.p.send({"type":"stop_audio"})
            return({"success":True})
        
        @self.app.post("/api/use_tts")
        def use_tts():
            if(self.tts_process is not None):
                if(self.tts_process.is_alive()):
                    return({"success":False})
            
            if(self.tts_db > time.perf_counter_ns()):
                return {"success":False}
            else:
                self.tts_db = time.perf_counter_ns() + 50000000
            data = request.get_json()
            self.tts_process = multiprocessing.Process(target=create_tts, args=(data["text"], self.p,))
            self.tts_process.start()

            return({"success":True})

        @self.app.post("/api/stop_tts")
        def stop_tts():
            if(self.tts_process is not None):
                if(self.tts_process.is_alive()):
                    return({"success":False})
            
            self.p.send({"type":"stop_tts"})

            return({"success":True})

        @self.app.post("/api/toggle_mod")
        def toggle_mod():
            data = request.get_json()
            if "mod_type" in data:
                self.p.send({"type":"toggle_mod", "mod_type":data["mod_type"], "value":data["value"]})
                if(data["mod_type"] == "sine"):
                    self.settings_data.sine_config["active"] = data["value"]
                if(data["mod_type"] == "triangular"):
                    self.settings_data.triangle_config["active"] = data["value"]
                if(data["mod_type"] == "rebound"):
                    self.settings_data.sine_config["active"] = data["value"]
            else:
                return({"success":False})
            
            return({"success":True})


        @self.app.post("/api/change_freq")
        def change_freq():
            data = request.get_json()
            if "mod_type" in data:
                self.p.send({"type":"freq_change", "mod_type":data["mod_type"], "value":data["value"]})
                if(data["mod_type"] == "sine"):
                    self.settings_data.sine_config["frequency"] = data["value"]
                if(data["mod_type"] == "triangular"):
                    self.settings_data.triangle_config["frequency"] = data["value"]
            else:
                return({"success":False})
            
            return({"success":True})
        
        @self.app.post("/api/change_mod_val")
        def change_mod_val():
            data = request.get_json()
            if "mod_type" in data:
                self.p.send({"type":"mod_val_change", "mod_type":data["mod_type"], "value":data["value"]})
                if(data["mod_type"] == "rebound"):
                    self.settings_data.rebound_config["decay"] = data["value"]
            else:
                return({"success":False})
            
            return({"success":True})

        @self.app.post("/api/tts_settings")
        def tts_semitone():
            data = request.get_json()
            if "value" in data:
                self.p.send({"type":"tts_settings", "setting":data["setting"], "value": data["value"]})
                self.settings_data.tts_config[data["setting"]] = data["value"]
            else:
                return({"success":False})
            
            return({"success":True})
        
        @self.app.post("/api/get_settings")
        def get_settings():
            data = request.get_json()
            if not "type" in data:
                return({"success":False})

            if(data["type"] == "voice"):
                return ({"success":True, "data": self.settings_data.config})
            if(data["type"] == "tts"):
                return ({"success":True, "data": self.settings_data.tts_config})
            if(data["type"] == "soundboard"):
                return ({"success":True, "data": self.settings_data.sb_config})
            if(data["type"] == "modulation"):
                return ({"success":True, "data": {"sine": self.settings_data.sine_config, "triangular": self.settings_data.triangle_config}})
            if(data["type"] == "active_modulation"):
                return ({"success":True, "data": {"rebound": self.settings_data.rebound_config}})
            
            return({"success":False})
        
        @self.app.post("/api/poll")
        def poll():
            return({})
        
        @self.app.post("/api/test_audio")
        def test_audio():
            if(self.test_process is not None):
                if(self.test_process.is_alive()):
                    self.stop_test_event.set()
                    return({"success":True,"active":False})
            
            if(self.test_db > time.perf_counter_ns()):
                return {"success":False}
            else:
                self.test_db = time.perf_counter_ns() + 50000000
            
            self.stop_test_event.clear()
            self.test_process = multiprocessing.Process(target=create_test_stream, args=(self.stop_test_event,))
            self.test_process.start()

            return({"success":True,"active":True})


    

        
    def listen(self,port=5000):
        self.app.run(port=port)