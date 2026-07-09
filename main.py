import os
import multiprocessing
import dotenv 
from application_classes.AudioEngine import AudioEngine
from application_classes.FlaskApp import FlaskApp



def create_engine(c):
    AudioEngine(c=c)

if __name__ == "__main__":
    if(not os.path.exists("tts_temp")):
        os.mkdir("tts_temp")
    if(not os.path.exists("sound_files")):
        os.mkdir("sound_files")

    dotenv.load_dotenv("vars.env")
    parent_conn, child_conn = multiprocessing.Pipe()
    process = multiprocessing.Process(target=create_engine, args=(parent_conn,))
    process.start()
    app = FlaskApp(p=child_conn)
    app.listen(os.environ["PORT"])
    if(app.tts_processs is not None):
        if(os.path.exists("tts_temp/audio.wav")):
            os.remove("tts_temp/audio.wav")
        if(app.tts_processs.is_alive()):
            app.tts_processs.join() 

    process.join()