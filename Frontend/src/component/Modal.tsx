import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Interface defining props for the Modal component
 * 
 * @interface ModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Function to call when modal should close
 * @property {string} [imageUrl] - URL of the generated face image to display
 * @property {string} [sketchUrl] - URL of the original sketch to display for comparison
 * @property {string} [message] - Success message to display with the generated face
 * @property {React.ReactNode} [children] - Additional content to render inside the modal
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  sketchUrl?: string;
  message?: string;
  children?: React.ReactNode;
}

/**
 * Modal component that displays the generated face result and original sketch
 * Provides comparison view and action buttons
 * 
 * @param {ModalProps} props - The props for the Modal component
 * @returns {JSX.Element | null} - The rendered Modal or null if closed
 */
export default function Modal({ isOpen, onClose, imageUrl, sketchUrl, message, children }: ModalProps) {
  // Reference to the modal container for handling outside clicks
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Effect hook to handle keyboard events and body scrolling
   * Sets up event listener for ESC key to close the modal
   * Prevents scrolling of background content while modal is open
   */
  useEffect(() => {
    /**
     * Event handler for keyboard events, closes modal on ESC key
     * 
     * @param {KeyboardEvent} event - The keyboard event
     */
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling of background content when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Clean up event listeners and restore scrolling when component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  /**
   * Handles clicks on the modal backdrop
   * Closes the modal if the click is outside the modal content area
   * 
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;
  return (    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm overflow-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-[#1A2332] rounded-lg overflow-hidden w-full max-w-4xl animate-fadeIn shadow-xl my-4"
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full"
          onClick={onClose}
        >
          <X size={20} />
        </button>        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image section */}            <div className="flex-1 flex flex-col items-center">
              <h2 className="text-white text-2xl font-bold mb-4">Generated Face</h2>
                {imageUrl && (
                <div className="relative w-full max-w-md">
                  <img 
                    src={imageUrl}
                    alt="Generated face" 
                    className="rounded-lg shadow-lg w-full object-cover border border-gray-700 aspect-square"
                  />
                  {message && (
                    <p className="text-center text-green-400 mt-3">{message}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Content section */}
            <div className="flex-1">
              <div className="text-center mb-4">
                <h3 className="text-white text-xl font-semibold mb-2">Your sketch produced excellent results!</h3>
                <p className="text-gray-300">Our AI has successfully transformed your sketch into a realistic face based on your provided description.</p>
              </div>
              
              {children}
            </div>
          </div>            {/* Comparison section - Side by side view of sketch and result */}
          <div className="mt-6 pt-6 border-t border-gray-700 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-white text-lg font-medium mb-4 text-center">Before & After Comparison</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Original sketch display */}
              <div className="flex-1 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-white text-sm mb-2 text-center">Original Sketch</h4>
                {sketchUrl ? (
                  <img
                    src={sketchUrl}
                    alt="Original sketch" 
                    className="h-64 w-full object-contain rounded-lg animate-fadeIn"
                  />
                ) : (
                  <div className="h-64 w-full rounded-lg bg-gray-800 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No sketch available</p>
                  </div>
                )}
                <p className="text-center text-gray-400 text-xs mt-2">Your uploaded sketch</p>
              </div>              {/* Generated face result display */}
              <div className="flex-1 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-white text-sm mb-2 text-center">Generated Result</h4>
                {imageUrl && (
                  <img
                    src={imageUrl} 
                    alt="Generated face" 
                    className="h-64 w-full object-contain rounded-lg animate-pulse-once"
                    // Animation provides visual feedback that this is the AI-generated result
                  />
                )}
                <p className="text-center text-gray-400 text-xs mt-2">AI-generated result</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}