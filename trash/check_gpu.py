import torch

print("=== GPU Configuration Check ===\n")

# Check PyTorch CUDA availability
print(f"PyTorch Version: {torch.__version__}")
print(f"CUDA Available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA Version: {torch.version.cuda}")
    print(f"GPU Device: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print(f"Current Device: {torch.cuda.current_device()}")
else:
    print("\n⚠️ CUDA not available!")
    print("Install CUDA-enabled PyTorch:")
    print("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")

# Check llama-cpp-python GPU support
print("\n=== Llama-cpp-python Check ===")
try:
    from llama_cpp import Llama
    print("✓ llama-cpp-python installed")
    print("\nFor GPU support, reinstall with:")
    print("pip uninstall llama-cpp-python -y")
    print("set CMAKE_ARGS=-DLLAMA_CUBLAS=on")
    print("pip install llama-cpp-python --no-cache-dir --force-reinstall")
except ImportError:
    print("✗ llama-cpp-python not installed")

print("\n" + "="*40)
