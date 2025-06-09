import requests
import json

COMFYUI_API_URL = "http://localhost:8188/prompt"  


def build_workflow(prompt: str, negative_prompt: str, image_path: str):
    with open("sketch to realistic.json", "r") as f:
        workflow = json.load(f)

    workflow["35"]["inputs"]["text"] = f"convert to realistic SRILANKAN image of person {prompt}."
    
    if negative_prompt:
        workflow["7"]["inputs"]["text"] = negative_prompt

    workflow["13"]["inputs"]["image"] = image_path

    return workflow


def send_to_comfyui(workflow_json):
    response = requests.post(COMFYUI_API_URL, json={"prompt": workflow_json})
    return response.json()
