# Indic Speech Translation App

A two-part application that transcribes Indic speech using NVIDIA's NeMo ASR toolkit and translates it to English using a Gradio web interface.

Due to Windows library compatibility issues with the older NeMo ASR toolkit, this project is split into two components:
1. **Frontend (Windows)**: A Gradio app that handles user audio input and translation.
2. **Backend (WSL/Linux)**: A FastAPI server running inside WSL that hosts the NeMo ASR model.

## Prerequisites

- **Windows 10/11** with **WSL (Windows Subsystem for Linux)** installed (Ubuntu 24.04 recommended).
- **Python 3.11/3.12** installed on both Windows and WSL.
- **IMPORTANT: Download the Model:** You must download the `indicconformer_stt_multi_hybrid_rnnt_600m.nemo` : LINK : https://github.com/AI4Bharat/IndicConformerASR?tab=readme-ov-file

## Installation & Setup

### 1. Backend Server (Inside WSL)

Open your WSL terminal (e.g., Ubuntu) and run the following commands to set up the Python virtual environment and install dependencies:

```bash
# Update package list and install venv if needed
sudo apt update
sudo apt install python3-venv

# Create a virtual environment in your home directory
python3 -m venv ~/nemo_env
source ~/nemo_env/bin/activate

# Install web server and audio processing dependencies
pip install fastapi uvicorn python-multipart pydub

# Install NeMo ASR Toolkit (version 1.23.0 is required for this model)
pip install "nemo_toolkit[asr]==1.23.0"

# Fix dependency conflicts
pip install "torchmetrics==0.10.3"
pip install "numpy<2.0"
```

### 2. Frontend App (On Windows)

Open your Windows command prompt or PowerShell, navigate to the project directory, and install the required frontend libraries:

```powershell
pip install gradio translate requests
```

## Running the Application

You must start the backend server first, then the frontend app.

### Step 1: Start the Backend (WSL)
In your WSL terminal, activate the environment and start the server:
```bash
# Navigate to your project folder (e.g., if it's on the D: drive)
cd /mnt/d/College/Translator

# Activate the environment
source ~/nemo_env/bin/activate

# Run the server
python3 wsl_server.py
```
*Wait for the message: `Uvicorn running on http://0.0.0.0:8000`*

### Step 2: Start the Frontend (Windows)
In your Windows PowerShell, run the Gradio app:
```powershell
python app.py
```

The Gradio web interface will open in your browser. You can now record or upload audio, and it will be transcribed by the NeMo model in WSL and translated locally on Windows.
