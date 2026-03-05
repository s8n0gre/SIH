import gradio as gr
from translate import Translator
import requests
import warnings
import os

warnings.filterwarnings('ignore')

# Initialize translator
translator = Translator(to_lang="en")

# The WSL server URL
WSL_API_URL = "http://localhost:8000/transcribe"

def process_audio(audio_path):
    if not audio_path:
        return "No audio provided.", "No audio provided."
    
    try:
        # 1. Send audio to the WSL server for transcription
        with open(audio_path, "rb") as f:
            files = {"audio": (os.path.basename(audio_path), f, "audio/wav")}
            response = requests.post(WSL_API_URL, files=files)
            
        if response.status_code != 200:
            return f"Server Error: {response.text}", "Error"
            
        data = response.json()
        if "error" in data:
            return f"Transcription Error: {data['error']}", "Error"
            
        transcript_text = data.get("transcript") or data.get("text", "")
        
        if not transcript_text:
            return "No transcription returned.", "No transcription returned."
            
        # 2. Translate in chunks to stay under MyMemory's 500-char limit
        def translate_chunked(text, limit=490):
            if len(text) <= limit:
                return translator.translate(text)
            # Split on spaces to avoid cutting mid-word
            words, chunks, current = text.split(), [], ""
            for word in words:
                if len(current) + len(word) + 1 > limit:
                    chunks.append(current.strip())
                    current = word
                else:
                    current += (" " + word if current else word)
            if current:
                chunks.append(current.strip())
            return " ".join(translator.translate(chunk) for chunk in chunks)

        translation = translate_chunked(transcript_text)
        
        return transcript_text, translation
        
    except requests.exceptions.ConnectionError:
        return "Connection Error: Is the WSL server running?", "Error"
    except Exception as e:
        return f"Error: {e}", "Error"

# Build Gradio UI
with gr.Blocks(title="Indic Speech to English Translator") as app:
    gr.Markdown("# 🗣️ Spoken Indic to English Translator")
    gr.Markdown("Speak into the microphone. The audio is sent to WSL for transcription, and translated into English here.")
    
    with gr.Row():
        audio_input = gr.Audio(sources=["microphone", "upload"], type="filepath", label="Audio Input")
        
    with gr.Row():
        transcription_output = gr.Textbox(label="Indic Transcription", lines=3)
        translation_output = gr.Textbox(label="English Translation", lines=3)
        
    translate_button = gr.Button("Transcribe & Translate", variant="primary")
    
    translate_button.click(
        fn=process_audio,
        inputs=audio_input,
        outputs=[transcription_output, translation_output]
    )

if __name__ == "__main__":
    app.launch(server_name="127.0.0.1", server_port=7860)
