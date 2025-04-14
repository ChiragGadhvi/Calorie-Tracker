
import { useEffect, useState } from "react";

interface LoadScriptProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LoadScript = ({ src, onLoad, onError }: LoadScriptProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      console.log("Script already exists in the DOM:", src);
      setLoaded(true);
      onLoad?.();
      return;
    }

    console.log("Loading script:", src);
    
    // Create script element
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    // Handle script loading
    script.onload = () => {
      console.log("Script loaded successfully:", src);
      setLoaded(true);
      setError(false);
      onLoad?.();
    };

    // Handle script error
    script.onerror = (e) => {
      console.error(`Error loading script: ${src}`, e);
      setError(true);
      onError?.();
    };

    // Append script to document head
    document.head.appendChild(script);

    // Clean up
    return () => {
      // Only remove script if it's not needed elsewhere
      // In most cases, for third-party scripts like Razorpay, 
      // we might want to keep them loaded throughout the app
    };
  }, [src, onLoad, onError]);

  return null;
};
