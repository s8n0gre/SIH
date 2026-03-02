# Local AI Server Setup

## Hardware Requirements Met ✅
- **GTX 1650**: 4GB VRAM (sufficient with 4-bit quantization)
- **Ryzen 5600H**: 6 cores (good for model loading)
- **RAM**: 16GB+ recommended

## Setup Instructions

### 1. Install Prerequisites
```bash
# Install Python 3.9+ and CUDA 11.8
# Download from: https://developer.nvidia.com/cuda-11-8-0-download-archive
```

### 2. Run Setup
```bash
cd local-ai-server
setup.bat
```

### 3. Start Server
```bash
start.bat
```

## Model Optimizations for GTX 1650

- **4-bit Quantization**: Reduces VRAM usage from 14GB to ~3.5GB
- **Float16**: Halves memory usage
- **Mistral-7B**: Smaller than LLaMA-13B but still powerful

## Performance Expectations

- **First Load**: ~2-3 minutes (downloads model)
- **Inference Time**: ~3-5 seconds per image
- **VRAM Usage**: ~3.5GB
- **RAM Usage**: ~8GB

## API Endpoint

```
POST http://localhost:5000/analyze
{
  "image": "base64_encoded_image"
}
```

## Troubleshooting

- **CUDA Error**: Install CUDA 11.8
- **Out of Memory**: Close other GPU applications
- **Slow Performance**: Ensure GPU drivers are updated