import requests
import json
import time
import os
from typing import Optional

COMFYUI_API_URL = "http://localhost:8188/prompt"
COMFYUI_HISTORY_URL = "http://localhost:8188/history"
COMFYUI_VIEW_URL = "http://localhost:8188/view"



def build_workflow(prompt: str, image_path: str):
    with open("sketch to realistic.json", "r") as f:
        workflow = json.load(f)
    
    workflow["6"]["inputs"]["text"] = f"convert to realistic SRILANKAN image of person {prompt}."
    
    
    workflow["13"]["inputs"]["image"] = image_path

    return workflow


def send_to_comfyui(workflow_json):
    # Wrap the workflow in the expected ComfyUI API format
    payload = {
        "prompt": workflow_json,
        "client_id": "python_client"  # Optional but recommended
    }
    
    response = requests.post(COMFYUI_API_URL, json=payload)

    return response.json()


def get_job_status(prompt_id: str):
    """Check if a ComfyUI job has completed"""
    try:
        response = requests.get(f"{COMFYUI_HISTORY_URL}/{prompt_id}")
        if response.status_code == 200:
            history = response.json()
            return prompt_id in history
        return False
    except Exception as e:
        print(f"Error checking job status: {e}")
        return False


def wait_for_completion(prompt_id: str, timeout: int = 300, check_interval: int = 2):
    """Wait for ComfyUI job to complete with timeout"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if get_job_status(prompt_id):
            return True
        time.sleep(check_interval)
    return False


def get_generated_images(prompt_id: str):
    """Retrieve the generated images from ComfyUI history"""
    try:
        response = requests.get(f"{COMFYUI_HISTORY_URL}/{prompt_id}")
        if response.status_code != 200:
            return []
        
        history = response.json()
        if prompt_id not in history:
            return []
        
        job_data = history[prompt_id]
        images = []
        
        # Look for SaveImage outputs in the job history
        if 'outputs' in job_data:
            for node_id, node_output in job_data['outputs'].items():
                if 'images' in node_output:
                    for image_info in node_output['images']:
                        images.append({
                            'filename': image_info['filename'],
                            'subfolder': image_info.get('subfolder', ''),
                            'type': image_info.get('type', 'output')
                        })
        
        return images
    except Exception as e:
        print(f"Error retrieving generated images: {e}")
        return []


def download_image(filename: str, subfolder: str = "", image_type: str = "output"):
    """Download an image from ComfyUI"""
    try:
        url = f"{COMFYUI_VIEW_URL}?filename={filename}&subfolder={subfolder}&type={image_type}"
        response = requests.get(url)
        if response.status_code == 200:
            return response.content
        return None
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None


def generate_and_get_image(prompt: str, image_path: str, timeout: int = 300):
    """Complete workflow: build, send, wait for completion, and retrieve image"""
    try:
        # Build and send workflow
        workflow = build_workflow(prompt, image_path)
        result = send_to_comfyui(workflow)
        
        if 'prompt_id' not in result:
            return None, "Failed to get prompt_id from ComfyUI"
        
        prompt_id = result['prompt_id']
        
        # Wait for completion
        if not wait_for_completion(prompt_id, timeout):
            return None, f"Job timed out after {timeout} seconds"
        
        # Get generated images
        images = get_generated_images(prompt_id)
        if not images:
            return None, "No images found in job output"
        
        # Download the first image
        first_image = images[0]
        image_data = download_image(
            first_image['filename'], 
            first_image['subfolder'], 
            first_image['type']
        )
        
        if image_data:
            return image_data, None
        else:
            return None, "Failed to download image"
            
    except Exception as e:
        return None, f"Error in generate_and_get_image: {str(e)}"
