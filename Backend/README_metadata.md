# Sketch to Image API - Metadata Removal

This API now includes automatic metadata removal from generated images for privacy and security.

## Endpoints

### 1. `/generate-image` (Download with Metadata Removal)
**Purpose**: Generate an image and return it as a downloadable file with all metadata removed.

**Method**: POST
**Content-Type**: multipart/form-data

**Parameters**:
- `prompt` (string): Description for the image generation
- `file` (file): Upload your sketch image

**Response**: 
- Returns the generated image as a PNG file download
- All EXIF data, GPS coordinates, and other metadata are automatically removed
- Content-Disposition header triggers automatic download

**Example using curl**:
```bash
curl -X POST "http://localhost:8000/generate-image" \
     -F "prompt=a beautiful landscape" \
     -F "file=@your_sketch.jpg" \
     --output generated_image.png
```

### 2. `/generate-image-view` (View with Metadata Removal)
**Purpose**: Generate an image and return it for viewing directly in browser with metadata removed.

**Method**: POST
**Content-Type**: multipart/form-data

**Parameters**:
- `prompt` (string): Description for the image generation  
- `file` (file): Upload your sketch image

**Response**:
- Returns the generated image as PNG for direct viewing
- All metadata automatically removed
- No download headers - displays in browser

**Example using curl**:
```bash
curl -X POST "http://localhost:8000/generate-image-view" \
     -F "prompt=a beautiful landscape" \
     -F "file=@your_sketch.jpg" \
     --output view_image.png
```

### 3. `/generate` (Original Endpoint)
**Purpose**: Generate image and return ComfyUI job information (no direct image download).

## Metadata Removal Features

### What Gets Removed:
- ✅ EXIF data (camera settings, GPS coordinates, timestamps)
- ✅ IPTC metadata (copyright, keywords, descriptions)  
- ✅ XMP metadata (editing software information)
- ✅ ICC color profiles
- ✅ Thumbnail images
- ✅ Any other embedded metadata

### Image Processing:
- Images are converted to clean PNG format
- RGBA images converted to RGB with white background
- Palette and grayscale images converted to RGB
- Optimized compression applied
- Original image quality maintained

### Error Handling:
- If metadata removal fails, original image is returned
- Errors are logged but don't break the image generation process
- Graceful fallback ensures you always get your generated image

## Requirements

### Python Dependencies:
```bash
pip install fastapi uvicorn requests Pillow
```

### ComfyUI Setup:
- ComfyUI must be running on `http://localhost:8188`
- Workflow file `sketch to realistic.json` must be present
- Make sure your ComfyUI has the required custom nodes installed

## Security Benefits

1. **Privacy Protection**: No location data or camera information leaked
2. **Software Anonymity**: No information about editing software used
3. **Timestamp Removal**: No creation or modification dates exposed
4. **Clean Distribution**: Safe to share images without revealing metadata

## Usage Tips

1. **For Downloads**: Use `/generate-image` when you want to save the file
2. **For Preview**: Use `/generate-image-view` when you want to see the result first
3. **For Integration**: Use `/generate` if you need job tracking and manual image retrieval

## Testing

Run the test script to verify metadata removal:
```bash
python test_metadata.py
```

This will test the endpoint and verify that metadata is properly removed from generated images.
