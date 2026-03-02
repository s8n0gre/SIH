@echo off
echo Setting up Local AI Server for GTX 1650...

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing PyTorch with CUDA support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo Installing other requirements...
pip install -r requirements.txt

echo Setup complete! Run start.bat to start the server.
pause