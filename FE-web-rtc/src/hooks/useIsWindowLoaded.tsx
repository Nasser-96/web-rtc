import { useEffect, useState } from "react";

/**
 * Hook to run code only when window object is available (client-side).
 */
const useWindowIsLoaded = () => {
  const [isWindow, setIsWindow] = useState<boolean>(false);
  useEffect(() => {
    // Check if window is defined to ensure this code runs only on the client-side
    if (typeof window !== "undefined") {
      setIsWindow(true);
    }
  }, []);
  return { isWindow };
};

export default useWindowIsLoaded;
