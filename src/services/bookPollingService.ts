import axios from "axios";
import { BookChange } from "../types";
import { API_CONFIG, STORAGE_KEYS, NOTIFICATION_CONFIG } from "../config";

let pollTimer: NodeJS.Timeout | null = null;

const fetchBookChanges = async (
  kind: "add-book" | "edit-book"
): Promise<BookChange[]> => {
  try {
    const response = await axios.get<BookChange[]>(
      `${API_CONFIG.BASE_URL}/recentchanges/${kind}.json`,
      {
        params: {
          limit: NOTIFICATION_CONFIG.POLLING_CHANGES_LIMIT,
          bot: false,
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    const changes = Array.isArray(response.data) ? response.data : [];
    return changes;
  } catch (error) {
    console.error(`Error fetching ${kind} changes:`, error);
    return [];
  }
};

const getNewChanges = (
  changes: BookChange[],
  lastSeenId: string | null
): BookChange[] => {
  if (!lastSeenId) {
    return changes;
  }

  const newChanges: BookChange[] = [];
  for (const change of changes) {
    if (change.id === lastSeenId) {
      break;
    }
    newChanges.push(change);
  }

  return newChanges;
};

const pollForChanges = async (callback: (changes: BookChange[]) => void): Promise<void> => {
  try {
    const lastSeenAddBookId = localStorage.getItem(STORAGE_KEYS.LAST_SEEN_ADD_BOOK_ID);
    const lastSeenEditBookId = localStorage.getItem(STORAGE_KEYS.LAST_SEEN_EDIT_BOOK_ID);

    const addBookChanges = await fetchBookChanges("add-book");
    const editBookChanges = await fetchBookChanges("edit-book");

    const newAddBookChanges = getNewChanges(addBookChanges, lastSeenAddBookId);
    const newEditBookChanges = getNewChanges(editBookChanges, lastSeenEditBookId);

    const allNewChanges = [...newAddBookChanges, ...newEditBookChanges];

    if (allNewChanges.length > 0) {
      try {
        callback(allNewChanges);
      } catch (error) {
        console.error("Error in notification callback:", error);
      }
    }

    if (addBookChanges.length > 0) {
      localStorage.setItem(STORAGE_KEYS.LAST_SEEN_ADD_BOOK_ID, addBookChanges[0].id);
    }
    if (editBookChanges.length > 0) {
      localStorage.setItem(STORAGE_KEYS.LAST_SEEN_EDIT_BOOK_ID, editBookChanges[0].id);
    }
  } catch (error) {
    console.error("Error polling for book changes:", error);
  }
};

export const startPolling = (callback: (changes: BookChange[]) => void): void => {
  if (!NOTIFICATION_CONFIG.POLLING_ENABLED || pollTimer) {
    return;
  }

  stopPolling();

  pollForChanges(callback);
  pollTimer = setInterval(() => pollForChanges(callback), NOTIFICATION_CONFIG.POLLING_INTERVAL);
};

export const stopPolling = (): void => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};
