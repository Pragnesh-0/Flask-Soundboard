class SettingsClass:

    def __init__(self):
        self.config = {
            "volume": 1,
            "semitone": 0
        }
        self.sb_config = {
            "volume": 1,
            "semitone": 0
        }
        self.sine_config = {
            "active": False,
            "frequency": 1,
        }
        self.triangle_config = {
            "active": False,
            "frequency": 1,
        }
        self.tts_config = {
            "volume": 1,
            "semitone": -12
        }
        self.rebound_config = {
            "active": False,
            "decay": 0.1
        }