import { useEffect, useRef, useState } from "react";
import { 
  startPolling, 
  stopPolling, 
  getPollingStatus 
} from "../services/bookPollingService";
import { notificationService } from "../services/notificationService";

export const useBookPolling = (pollInterval: number = 10000) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<number | null>(null);
  const isInitialized = useRef(false);
  
  // Add hook instance tracking
  const hookId = useRef(Math.random().toString(36).substr(2, 9));
  
  console.log(`🎣 [${hookId.current}] useBookPolling hook called, isInitialized: ${isInitialized.current}`);

  // Start polling for book changes
  const startPollingHandler = () => {
    if (isPolling) {
      console.log(`⚠️ [${hookId.current}] Hook: Polling already active, ignoring start request`);
      return;
    }

    console.log(`🚀 [${hookId.current}] Hook: Starting polling...`);
    setLastPollTime(Date.now());

    startPolling(async (changes) => {
      if (changes.length > 0) {
        setLastPollTime(Date.now());
        
        try {
          await notificationService.notifyMultipleBookChanges(changes);
        } catch (error) {
          console.error("Error showing notifications:", error);
        }
      } else {
        setLastPollTime(Date.now());
      }
    }, pollInterval);

    setIsPolling(true);
  };

  // Stop polling for book changes
  const stopPollingHandler = () => {
    stopPolling();
    setIsPolling(false);
  };

  // Auto-start polling when component mounts
  useEffect(() => {
    startPollingHandler();

    // Cleanup on unmount
    return () => {
      stopPollingHandler();
    };
  }, []);

  return {
    isPolling,
    lastPollTime,
    startPolling: startPollingHandler,
    stopPolling: stopPollingHandler,
  };
};
