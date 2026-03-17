#!/bin/bash
# scripts/download-models.sh
set -e

MODEL_DIR="models"
HF_REPO="onnx-community/Kokoro-82M-v1.0-ONNX"
BASE_URL="https://huggingface.co/$HF_REPO/resolve/main"

echo "Downloading Kokoro TTS models into $MODEL_DIR..."

mkdir -p "$MODEL_DIR/onnx"

# Essential files for kokoro-js
FILES=("config.json" "tokenizer.json" "tokenizer_config.json" "voices.json")

for file in "${FILES[@]}"; do
    if [ ! -f "$MODEL_DIR/$file" ]; then
        echo "Downloading $file..."
        curl -L "$BASE_URL/$file" -o "$MODEL_DIR/$file"
    else
        echo "$file already exists."
    fi
done

# The large quantized ONNX model
if [ ! -f "$MODEL_DIR/onnx/model_quantized.onnx" ]; then
    echo "Downloading onnx/model_quantized.onnx (~88MB)..."
    curl -L "$BASE_URL/onnx/model_quantized.onnx" -o "$MODEL_DIR/onnx/model_quantized.onnx"
else
    echo "onnx/model_quantized.onnx already exists."
fi

echo "All models downloaded successfully."
