import { useEffect, useState } from "react";

interface LoadScriptProps {
  src: string;
  onLoad?: () => void;
}

export const LoadScript = ({ src, onLoad }: LoadScriptProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      setLoaded(true);
      onLoad?.();
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    // Handle script loading
    script.onload = () => {
      setLoaded(true);
      onLoad?.();
    };

    // Append script to document head
    document.head.appendChild(script);

    // Clean up
    return () => {
      // Only remove script if it's not needed elsewhere
      // In most cases, for third-party scripts like Razorpay, 
      // we might want to keep them loaded throughout the app
    };
  }, [src, onLoad]);

  return null;
};
