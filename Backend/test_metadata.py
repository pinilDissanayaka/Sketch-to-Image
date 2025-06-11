#!/usr/bin/env python3
"""
Test script to verify metadata removal functionality
"""
import requests
import io
from PIL import Image
from PIL.ExifTags import TAGS

def test_metadata_removal():
    """Test the metadata removal endpoint"""
    
    # Create a test image with metadata
    test_image = Image.new('RGB', (100, 100), color='red')
    
    # Add some fake EXIF data
    exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
    exif_dict["0th"][272] = "Test Camera"  # Make
    exif_dict["0th"][306] = "2025:06:11 12:00:00"  # DateTime
    
    # Save image with metadata to bytes
    img_buffer = io.BytesIO()
    test_image.save(img_buffer, format='JPEG', exif=test_image.getexif())
    img_buffer.seek(0)
    
    print("✅ Test image created with metadata")
    
    # Test if server is running
    try:
        response = requests.get("http://localhost:8000")
        print("✅ Server is running")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start the server first.")
        return
    
    # Test the metadata removal endpoint
    files = {'file': ('test.jpg', img_buffer.getvalue(), 'image/jpeg')}
    data = {'prompt': 'test image generation'}
    
    print("📤 Testing /generate-image-view endpoint...")
    
    try:
        # Note: This will only work if ComfyUI is also running
        response = requests.post("http://localhost:8000/generate-image-view", files=files, data=data)
        
        if response.status_code == 200:
            print("✅ Endpoint responded successfully")
            
            # Check if returned image has metadata removed
            returned_image = Image.open(io.BytesIO(response.content))
            exif_data = returned_image.getexif()
            
            if len(exif_data) == 0:
                print("✅ Metadata successfully removed from returned image")
            else:
                print("⚠️  Some metadata still present in returned image")
                
        else:
            print(f"⚠️  Endpoint returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")

if __name__ == "__main__":
    test_metadata_removal()
