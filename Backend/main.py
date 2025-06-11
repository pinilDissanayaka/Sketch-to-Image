import os
import uvicorn
import io
from fastapi import FastAPI, UploadFile, Form, File
from fastapi.responses import JSONResponse, Response
from comfyui_client import build_workflow, send_to_comfyui, generate_and_get_image
from pathlib import Path
from PIL import Image

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def remove_image_metadata(image_data: bytes) -> bytes:
    """Remove metadata from image and return clean image bytes"""
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Create a new image without metadata
        # Convert to RGB if necessary to ensure compatibility
        if image.mode in ('RGBA', 'LA', 'P'):
            # Convert RGBA/LA/P to RGB with white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save to bytes without metadata
        output_buffer = io.BytesIO()
        image.save(output_buffer, format='PNG', optimize=True)
        
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error removing metadata: {e}")
        # Return original data if metadata removal fails
        return image_data


@app.post("/generate")
async def generate_image_with_upload(
    prompt: str = Form(...),
    file: UploadFile = File(...)
):
    if file:
        # Sanitize filename and get absolute path
        filename = os.path.basename(file.filename)
        image_path = os.path.join(UPLOAD_DIR, filename)
        abs_image_path = str(Path(image_path).resolve())

        # Save uploaded image
        with open(image_path, "wb") as f:
            f.write(await file.read())

        # Build workflow JSON for ComfyUI
        try:
            workflow = build_workflow(prompt=prompt, image_path=abs_image_path)
        except Exception as e:
            return JSONResponse(status_code=400, content={"status": "error", "message": f"Workflow build failed: {str(e)}"})

        # Send workflow to ComfyUI
        try:
            result = send_to_comfyui(workflow)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return JSONResponse(status_code=500, content={"status": "error", "message": f"ComfyUI API failed: {str(e)}"})

    return JSONResponse(status_code=400, content={"status": "error", "message": "No file uploaded"})


@app.post("/generate-image")
async def generate_and_download_image(
    prompt: str = Form(...),
    file: UploadFile = File(...)
):
    """Generate image and return it directly as download"""
    if not file:
        return JSONResponse(status_code=400, content={"status": "error", "message": "No file uploaded"})

    # Sanitize filename and get absolute path
    filename = os.path.basename(file.filename)
    image_path = os.path.join(UPLOAD_DIR, filename)
    abs_image_path = str(Path(image_path).resolve())

    # Save uploaded image
    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Generate image using ComfyUI
    try:
        image_data, error = generate_and_get_image(prompt=prompt, image_path=abs_image_path)
        if error:
            return JSONResponse(status_code=500, content={"status": "error", "message": error})
        
        if image_data:
            # Remove metadata from the image
            clean_image_data = remove_image_metadata(image_data)
            
            # Return the clean image as a downloadable response
            return Response(
                content=clean_image_data,
                media_type="image/png",
                headers={
                    "Content-Disposition": "attachment; filename=generated_image.png"
                }
            )
        else:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Failed to generate image"})
            
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Generation failed: {str(e)}"})


@app.post("/generate-image-view")
async def generate_and_view_image(
    prompt: str = Form(...),
    file: UploadFile = File(...)
):
    """Generate image and return it for viewing in browser"""
    if not file:
        return JSONResponse(status_code=400, content={"status": "error", "message": "No file uploaded"})

    # Sanitize filename and get absolute path
    filename = os.path.basename(file.filename)
    image_path = os.path.join(UPLOAD_DIR, filename)
    abs_image_path = str(Path(image_path).resolve())

    # Save uploaded image
    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Generate image using ComfyUI
    try:
        image_data, error = generate_and_get_image(prompt=prompt, image_path=abs_image_path)
        if error:
            return JSONResponse(status_code=500, content={"status": "error", "message": error})
        
        if image_data:
            # Remove metadata from the image
            clean_image_data = remove_image_metadata(image_data)
            
            # Return the clean image for viewing in browser
            return Response(
                content=clean_image_data,
                media_type="image/png"
            )
        else:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Failed to generate image"})
            
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Generation failed: {str(e)}"})


if __name__ == "__main__":
    uvicorn.run(app, port=8000)
