# Flask-Soundboard
A python sound board application controlled on a browser.

Uses VB-Cable, WAV exclusive

To add audios; create folder called sound_files in the same root as main.py
Ensure that a tts_temp folder exists in the same root so that the system can find tts Audios

Limitations-
Due to large audio chunk for the buffer when streaming, there is a delay of about 200ms
No file imports you need to manually add to the sound_files folder

Extensible- 
Can include hotkey classes or other systems to call the different flask endpoints
Can change the TTS library used. (Currently using Pyttsx3)
Can add new modulation types
Frontend can also be change; Ensure that new dist is replaced correctly