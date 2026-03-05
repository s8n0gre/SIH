@echo off
echo ========================================
echo Installing CUDA Support for GTX 1650
echo ========================================
echo.


echo Step 2: Installing llama-cpp-python with CUDA support...
pip uninstall llama-cpp-python -y
set CMAKE_ARGS=-DGGML_CUDA=on
pip install llama-cpp-python --no-cache-dir --force-reinstall
echo.

echo Step 3: Verifying GPU setup...
python check_gpu.py
echo.

echo ========================================
echo Installation Complete!
echo ========================================
pause
