import { useEffect, useState } from 'react';

/**
 * Interface defining props for the LoadingScreen component
 * 
 * @interface LoadingScreenProps
 * @property {boolean} isVisible - Controls the visibility of the loading screen
 * @property {string} [message] - Optional custom loading message
 */
interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Attractive loading screen component for face generation process
 * Features animated progress, dynamic messages, and modern design
 * 
 * @param {LoadingScreenProps} props - The props for the LoadingScreen component
 * @returns {JSX.Element | null} - The rendered LoadingScreen or null if not visible
 */
export default function LoadingScreen({ isVisible, message }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState('');
  // Dynamic loading messages that cycle during generation
  const loadingMessages = [
    "Uploading your sketch...",
    "AI analyzing your image...",
    "Generating realistic features...",
    "Applying final enhancements...",
    "Preparing your result...",
    "Almost ready..."
  ];

  /**
   * Effect to animate progress bar and cycle through messages
   */
  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentMessageIndex(0);
      setDots('');
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95; // Stop at 95% until actual completion
        return prev + Math.random() * 15 + 5; // Random progress increments
      });
    }, 300);

    // Message cycling
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => 
        prev >= loadingMessages.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [isVisible, loadingMessages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border border-gray-700">
        
        {/* Animated AI Brain Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-cyan-500/30 rounded-full animate-spin">
              <div className="absolute inset-2 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            
            {/* Central AI icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main loading title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Generating Your Face
          </h2>
          <p className="text-gray-300 text-sm">
            Our AI is working its magic on your sketch
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-cyan-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Dynamic status message */}
        <div className="text-center mb-6">
          <p className="text-white font-medium text-lg">
            {message || loadingMessages[currentMessageIndex]}
            <span className="text-cyan-400">{dots}</span>
          </p>
        </div>

        {/* Processing steps visualization */}
        <div className="space-y-3 mb-6">
          {loadingMessages.slice(0, 4).map((step, index) => {
            const isActive = currentMessageIndex === index;
            const isCompleted = currentMessageIndex > index;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 scale-110' 
                    : isActive 
                      ? 'bg-cyan-400 animate-pulse scale-110' 
                      : 'bg-gray-600'
                }`}></div>
                <span className={`text-sm transition-colors duration-300 ${
                  isCompleted 
                    ? 'text-green-400 line-through' 
                    : isActive 
                      ? 'text-cyan-400 font-medium' 
                      : 'text-gray-500'
                }`}>
                  {step.replace('...', '')}
                </span>
                {isCompleted && (
                  <svg className="w-4 h-4 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Fun fact or tip */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-400 text-sm font-medium mb-1">Did you know?</p>
              <p className="text-gray-300 text-xs">
                Our AI analyzes thousands of facial features to create the most realistic representation of your sketch.
              </p>
            </div>
          </div>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-70"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
