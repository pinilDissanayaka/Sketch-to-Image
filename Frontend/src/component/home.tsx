import { useState, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Loader, Download, RotateCcw } from 'lucide-react';
import Modal from './Modal';

/**
 * Main component for the Sketch to Face application.
 * This interface allows users to upload sketch images, provide descriptions,
 * select a gender, and generate realistic AI-based faces.
 * 
 * @returns {JSX.Element} The complete Sketch to Face interface
 */
export default function SketchToFaceInterface() {
  // State for drag and drop functionality
  const [dragOver, setDragOver] = useState(false);
  // State to store the uploaded sketch file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State for the user's description input
  const [description, setDescription] = useState('');
  // State for gender selection (male/female)
  const [selectedGender, setSelectedGender] = useState('');
  // State to track loading/processing status
  const [isLoading, setIsLoading] = useState(false);
  // State for storing error messages
  const [errorMessage, setErrorMessage] = useState('');
  // State to store the generated face result
  const [result, setResult] = useState<{ imageUrl?: string; message?: string } | null>(null);
  // State for displaying notification messages
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  // State to control the visibility of the result modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  /**
   * Effect hook to automatically hide notifications after a delay
   * Clears the notification after 5 seconds
   */
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);  /**
   * Handles the dragover event for the file upload area
   * Prevents default browser behavior and updates UI state
   * 
   * @param {DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  /**
   * Handles the dragleave event for the file upload area
   * Prevents default browser behavior and resets UI state
   * 
   * @param {DragEvent<HTMLDivElement>} e - The drag event
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  /**
   * Handles the drop event when a user drops a file onto the upload area
   * Processes the dropped file if it's a valid image format
   * 
   * @param {DragEvent<HTMLDivElement>} e - The drop event
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        // Use the same image processing function for drag and drop
        processImage(file);
      } else {
        setNotification({
          type: 'error',
          message: 'Please drop a valid image file (JPG, PNG or GIF)'
        });
      }
    }
  };  /**
   * Handles the file selection event when a user chooses a file through the file input
   * Validates the selected file format and processes it if valid
   * 
   * @param {ChangeEvent<HTMLInputElement>} e - The change event from the file input
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        // Process image before setting it
        processImage(file);
      } else {
        setNotification({
          type: 'error',
          message: 'Please select a valid image file (JPG, PNG or GIF)'
        });
      }
    }
  };
    /**
   * Processes and optimizes an image file before uploading
   * Resizes the image to acceptable dimensions while maintaining aspect ratio
   * Converts the image to a more efficient format/size
   * 
   * @param {File} file - The image file to process
   */
  const processImage = (file: File) => {
    // Create an image element to load the file
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release object URL after image is loaded
      URL.revokeObjectURL(objectUrl);
      
      // Set max dimensions for the image
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas with the new dimensions
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new File object from the blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: new Date().getTime()
            });
            
            setSelectedFile(resizedFile);
            setNotification({
              type: 'success',
              message: 'Image uploaded and optimized successfully!'
            });
          }
        }, file.type);
      } else {
        // Fallback if canvas context is not available
        setSelectedFile(file);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setNotification({
        type: 'error',
        message: 'Error loading image. Please try another file.'
      });
    };
    
    img.src = objectUrl;
  };  /**
   * Handles the submission of the sketch and associated data for processing
   * Validates all required inputs, prepares form data, and submits to the API
   * Shows appropriate loading states and error handling
   * 
   * @returns {Promise<void>} A promise that resolves when submission is complete
   */
  const handleSubmit = async () => {
    // Reset states before starting new submission
    setErrorMessage('');
    setNotification(null);
    
    // Validate inputs - check if sketch is uploaded
    if (!selectedFile) {
      setNotification({
        type: 'error',
        message: 'Please upload a sketch first'
      });
      return;
    }
    
    if (!description.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a description'
      });
      return;
    }
    
    if (!selectedGender) {
      setNotification({
        type: 'error',
        message: 'Please select a gender'
      });
      return;
    }
    
    // Set loading state
    setIsLoading(true);
      try {
      // Create a FormData instance to send the file and other data to the API
      const formData = new FormData();
      formData.append('sketch', selectedFile);  // The user's sketch image file
      formData.append('description', description);  // The text description provided by user
      formData.append('gender', selectedGender);  // Selected gender (male/female)
      
      // For demo purposes, simulate a 2-second delay to mimic API processing time
      // In production, replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // PRODUCTION API ENDPOINT IMPLEMENTATION:
      // The following code should be uncommented and configured when connecting to the real backend
      // 
      // const response = await fetch('/api/convert-sketch', {
      //   method: 'POST',
      //   body: formData,
      //   // Include any necessary headers like authentication tokens if required
      //   // headers: {
      //   //   'Authorization': `Bearer ${authToken}`
      //   // }
      // });
      // 
      // // Check if the response was successful (status code 2xx)
      // if (!response.ok) {
      //   // Extract error message if available in response or use default
      //   const errorData = await response.json().catch(() => ({}));
      //   throw new Error(errorData.message || 'Failed to process the sketch');
      // }
      // 
      // // Parse the successful response data
      // const data = await response.json();
        // Simulate successful response with mock data for demo purposes
      // In production environment, this would be replaced with actual API response data
      const mockResult = {
        imageUrl: 'https://thispersondoesnotexist.com',  // URL to the AI-generated face image
        message: 'Face successfully generated!'  // Success message from the API
      };
        
      // Store the generated face result in component state
      // In production, this would use the actual API response: setResult(data);
      setResult(mockResult);
      
      // Display a success notification to inform the user
      setNotification({
        type: 'success',
        message: 'Face was successfully generated from your sketch!'
      });
      
      // Display the result modal to show the generated face
      setIsModalOpen(true);
      
      // Reset loading state after processing is complete
      setIsLoading(false);
      
    } catch (error) {
      // Log the error to console for debugging purposes
      console.error('Error processing sketch:', error);
      
      // Show user-friendly error notification
      setNotification({
        type: 'error',
        message: 'Failed to process the sketch. Please try again.'
      });
      
      // Reset loading state to enable retrying
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Header Section */}      
      <header className="w-full bg-gray-800 py-4 px-2 shadow-md">
        <a href='#'>
        <div className="max-w-7xl mx-auto flex items-center justify-between">          
            <div className="flex items-center">
            <div className="relative w-10 h-10 mr-2 rounded-full  flex items-center justify-center">
              <img src="./logo.png" alt="" />
            
            </div>
            <h1 className="text-white text-xl font-medium">FaceTrace</h1>
          </div>
        </div>
        </a>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 py-8">
        <div className="w-full max-w-4xl space-y-8">
        
        {/* Upload Sketch Section */}
        <div className="text-left">
          <h2 className="text-white text-xl font-medium mb-6">Upload Sketch</h2>          <div
            className={`w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
              selectedFile
                ? 'border-green-400 bg-[#1E1E1E]'
                : dragOver 
                  ? 'border-cyan-400 bg-transparent' 
                  : 'border-gray-600 hover:border-cyan-400 hover:bg-gray-800'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="hidden"
            />              <div className="h-full flex flex-col items-center justify-center space-y-4">
              {selectedFile ? (
                <div className="relative h-full w-full flex items-center justify-center p-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full bg-gray-900/20 backdrop-blur-sm absolute rounded-lg"></div>
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Selected sketch" 
                      className="max-h-full max-w-full object-contain rounded-lg z-10 shadow-lg"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-lg z-20 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-white text-xs truncate max-w-[150px]">{selectedFile.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to convert
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        className="bg-cyan-600/80 hover:bg-cyan-600 p-1 rounded-full text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('fileInput')?.click();
                        }}
                        title="Replace image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                          <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                        </svg>
                      </button>
                      <button 
                        className="bg-red-600/80 hover:bg-red-600 p-1 rounded-full text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-white text-base mb-2">
                      Drag and drop your sketch here
                    </p>
                    <p className="text-gray-400 text-sm">JPG, PNG, GIF accepted</p>
                    <p className="text-gray-500 text-xs mt-2">Image will be optimized automatically</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description Input Section */}
        <div className="text-left">
          <h2 className="text-white text-xl font-medium mb-6">Describe the Subject</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type your prompt or description here..."
            className="w-full h-24 bg-[#1E1E1E] border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-400 transition-colors duration-200"
          />
        </div>

        {/* Gender Selection Section */}
        <div className="text-center">
          <h2 className="text-white text-xl font-medium mb-6">Select Gender</h2>
          <div className="flex justify-center space-x-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={selectedGender === 'male'}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedGender === 'male' 
                  ? 'border-white bg-white' 
                  : 'border-gray-500 hover:border-white'
              }`}>
                {selectedGender === 'male' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                )}
              </div>
              <span className="text-white text-lg">Male</span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={selectedGender === 'female'}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedGender === 'female' 
                  ? 'border-white bg-white' 
                  : 'border-gray-500 hover:border-white'
              }`}>
                {selectedGender === 'female' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                )} 
              </div>
              <span className="text-white text-lg">Female</span>
            </label>
          </div>
        </div>
        
        {/* Error Message Display */}
        {errorMessage && (
          <div className="text-center">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}        {/* Submit Button Section */}
        <div className="flex flex-col items-center justify-center pt-6 w-full">          <button
            onClick={handleSubmit}
            disabled={isLoading}            className={`w-full py-3 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg ${
              isLoading
                ? 'bg-gray-700 text-gray-800 cursor-not-allowed'
                : 'bg-gradient-to-r border-1 border-white hover:from-cyan-100 hover:to-blue-100 text-white hover:text-black transform hover:-translate-y-0.'
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Generate Face
              </>
            )}
          </button>
          <p className="mt-40 text-gray-400 text-sm text-center">Our AI will generate a realistic face based on your sketch</p>
        </div>
          {/* Notification Display */}
        {notification && (
          <div className={`mt-4 p-4 rounded-lg text-center animate-fadeIn flex items-center justify-center ${
            notification.type === 'success' ? 'bg-green-800/50 text-green-300 border border-green-500/30' : 'bg-red-800/50 text-red-300 border border-red-500/30'
          }`}>
            <div className="mr-3">
              {notification.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="font-medium">{notification.message}</p>
          </div>
        )}{/* Result Display Section */}
        {result && (
          <div className="mt-8 p-6 bg-gray-800 rounded-xl text-center animate-fadeIn shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="md:flex-1">
                <h2 className="text-white w-12 text-2xl font-semibold mb-6 text-center">Generated Face</h2>
                <div className="w-64 h-64 mx-auto bg-gray-700 rounded-lg overflow-hidden mb-4 shadow-xl ring-2 ring-cyan-500/50">
                  <img 
                    src={result.imageUrl} 
                    alt="Generated face" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-face.jpg';
                    }}
                  />
                </div>
                <p className="text-green-400 mb-2">{result.message}</p>
              </div>
              
              <div className="md:flex-1 mt-6 md:mt-0">
                <div className="mb-6 text-center">
                  <h3 className="text-white text-lg mb-2">Your sketch produced excellent results!</h3>
                  <p className="text-gray-300 text-sm">Our AI has successfully transformed your sketch into a realistic face based on your provided description.</p>
                </div>
                  <div className="flex flex-col space-y-4 w-full">
                  <button 
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => {
                      // Add download functionality here if needed
                      const link = document.createElement('a');
                      link.href = result.imageUrl || '';
                      link.download = 'generated-face.jpg';
                      link.click();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Image
                  </button>
                  <button 
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => {
                      setResult(null);
                      setSelectedFile(null);
                      setDescription('');
                      setSelectedGender('');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Create New Image
                  </button>
                </div>
              </div>
            </div>
          </div>        )}
          </div>
      </main>
        {/* Modal for displaying the generated face */}
      {result && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          imageUrl={result.imageUrl} // Pass the URL of the generated face image
          // Create an object URL from the selected file for display in the modal
          // This allows comparing the original sketch with the generated result
          sketchUrl={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
          message={result.message} // Pass any success/info message from the API
        >          
        <div className="flex flex-col space-y-4 mt-4">
            <button 
              className="py-3 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-lg transition-colors flex items-center justify-center shadow-md"
              onClick={() => {
                // Create a download link for the generated face image
                const link = document.createElement('a');
                link.href = result.imageUrl || '';
                link.download = 'generated-face.jpg';
                link.click(); // Programmatically trigger the download
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Image
            </button>
              <button 
              className="py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center border border-gray-600"
              onClick={() => {
                // Reset the entire application state to create a new image:
                setIsModalOpen(false);       // Close the modal
                setResult(null);             // Clear the generated result
                setSelectedFile(null);       // Clear the uploaded sketch
                setDescription('');          // Reset description input
                setSelectedGender('');       // Reset gender selection
              }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Create New Image
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}