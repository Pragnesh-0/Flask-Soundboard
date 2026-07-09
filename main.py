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
    app.listen(os.environ.get("PORT", 5000))
    if(app.tts_process is not None):
        if(os.path.exists("tts_temp/audio.wav")):
            os.remove("tts_temp/audio.wav")
        if(app.tts_process.is_alive()):
            app.tts_process.join()

    if(app.test_process is not None):
        if(app.test_process.is_alive()):
            app.stop_test_event.set()
            app.test_process.terminate()
            app.test_process.join()
    

    process.join()