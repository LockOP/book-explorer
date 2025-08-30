import { useEffect, useRef, useState } from "react";
import {
  startPolling,
  stopPolling,
  getPollingStatus,
} from "../services/bookPollingService";
import { notificationService } from "../services/notificationService";

export const useBookPolling = (pollInterval: number = 10000) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<number | null>(null);
  const isInitialized = useRef(false);

  const hookId = useRef(Math.random().toString(36).substr(2, 9));

  const startPollingHandler = () => {
    if (isPolling) {
      return;
    }
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
    lastPollTime,
    startPolling: startPollingHandler,
    stopPolling: stopPollingHandler,
  };
};
