import { useEffect, useState } from "react";
import { startPolling, stopPolling } from "../services/bookPollingService";
import { notificationService } from "../services/notificationService";

export const useBookPolling = () => {
  const [isPolling, setIsPolling] = useState(false);

  const startPollingHandler = () => {
    if (isPolling) {
      return;
    }
    startPolling(async (changes) => {
      if (changes.length > 0) {
        try {
          await notificationService.notifyMultipleBookChanges(changes);
        } catch (error) {
          console.error("Error showing notifications:", error);
        }
      }
    });

    setIsPolling(true);
  };

  const stopPollingHandler = () => {
    stopPolling();
    setIsPolling(false);
  };

  useEffect(() => {
    startPollingHandler();

    return () => {
      stopPollingHandler();
    };
  }, []);

  return {
    isPolling,
  };
};
