import os
import uvicorn
from fastapi import FastAPI, UploadFile, Form, File
from comfyui_client import build_workflow, send_to_comfyui

app = FastAPI()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/generate")
async def generate_image_with_upload(
    prompt: str = Form(...),
    negative_prompt: str = Form(""),
    file: UploadFile = File(...)
):
    if file:
        image_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(image_path, "wb") as f:
            f.write(file.file.read())

    
    return {"status": "submitted", "details": "done"}



if __name__ == "__main__":
    uvicorn.run(app, port=8000)
