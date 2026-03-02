# AI Models Setup

## Folder Structure
```
tm-roads-model/          - Road & pothole detection
tm-streetlights-model/   - Streetlight issues
tm-waste-model/          - Litter & waste detection  
tm-water-leaks-model/    - Water leak detection
tm-other-model/          - Other municipal issues
```

## How to Add Your Trained Models

For each category, replace the placeholder files with your Teachable Machine exports:

### 1. Train your model at teachablemachine.withgoogle.com
### 2. Download the model files (3 files per model)
### 3. Replace files in the corresponding folder:

**tm-roads-model/**
- Replace: `model.json`, `weights.bin`, `metadata.json`
- Detects: Potholes vs Good Roads

**tm-streetlights-model/**  
- Replace: `model.json`, `weights.bin`, `metadata.json`
- Detects: Broken vs Working Streetlights

**tm-waste-model/**
- Replace: `model.json`, `weights.bin`, `metadata.json`  
- Detects: Litter vs Clean Areas

**tm-water-leaks-model/**
- Replace: `model.json`, `weights.bin`, `metadata.json`
- Detects: Water Leaks vs No Leaks

**tm-other-model/**
- Replace: `model.json`, `weights.bin`, `metadata.json`
- Detects: Other Issues vs Normal

## Notes
- Keep the same folder names
- Each model should have exactly 3 files
- The system will automatically load and use all available models