import axios from "axios";
import { BookChange } from "../types";

const BASE_URL = "https://openlibrary.org";

let lastSeenAddBookId: string | null = null;
let lastSeenEditBookId: string | null = null;
let isPolling: boolean = false;
let pollTimer: NodeJS.Timeout | null = null;
let onNewChanges: ((changes: BookChange[]) => void) | null = null;

const loadLastSeenIds = (): void => {
  try {
    const savedAddBook = localStorage.getItem("bookExplorer_lastSeenAddBookId");
    const savedEditBook = localStorage.getItem(
      "bookExplorer_lastSeenEditBookId"
    );

    if (savedAddBook) lastSeenAddBookId = savedAddBook;
    if (savedEditBook) lastSeenEditBookId = savedEditBook;
  } catch (error) {
    console.error("Error loading last seen IDs from localStorage:", error);
  }
};

const saveLastSeenIds = (): void => {
  try {
    if (lastSeenAddBookId) {
      localStorage.setItem("bookExplorer_lastSeenAddBookId", lastSeenAddBookId);
    }
    if (lastSeenEditBookId) {
      localStorage.setItem(
        "bookExplorer_lastSeenEditBookId",
        lastSeenEditBookId
      );
    }
  } catch (error) {
    console.error("Error saving last seen IDs to localStorage:", error);
  }
};

const fetchBookChanges = async (
  kind: "add-book" | "edit-book"
): Promise<BookChange[]> => {
  try {
    const response = await axios.get<BookChange[]>(
      `${BASE_URL}/recentchanges/${kind}.json`,
      {
        params: {
          limit: 5,
          bot: false,
        },
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
  lastSeenId: string | null,
  changeType: string
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

const pollForChanges = async (): Promise<BookChange[]> => {
  try {
    const currentLastSeenAddBookId = localStorage.getItem(
      "bookExplorer_lastSeenAddBookId"
    );
    const currentLastSeenEditBookId = localStorage.getItem(
      "bookExplorer_lastSeenEditBookId"
    );

    const addBookChanges = await fetchBookChanges("add-book");
    const editBookChanges = await fetchBookChanges("edit-book");

    const newAddBookChanges = getNewChanges(
      addBookChanges,
      currentLastSeenAddBookId,
      "add-book"
    );
    const newEditBookChanges = getNewChanges(
      editBookChanges,
      currentLastSeenEditBookId,
      "edit-book"
    );

    const allNewChanges = [...newAddBookChanges, ...newEditBookChanges];

    if (allNewChanges.length > 0 && onNewChanges) {
      const currentCallback = onNewChanges;
      onNewChanges = null;

      try {
        currentCallback(allNewChanges);
      } catch (error) {
        console.error("Error in notification callback:", error);
      } finally {
        onNewChanges = currentCallback;
      }
    }

    if (addBookChanges.length > 0) {
      lastSeenAddBookId = addBookChanges[0].id;
    }
    if (editBookChanges.length > 0) {
      lastSeenEditBookId = editBookChanges[0].id;
    }

    saveLastSeenIds();

    return allNewChanges;
  } catch (error) {
    console.error("Error polling for book changes:", error);
    return [];
  }
};

export const startPolling = (
  callback: (changes: BookChange[]) => void,
  pollInterval: number = 10000
): void => {
  if (isPolling) {
    return;
  }

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  onNewChanges = callback;
  isPolling = true;

  pollForChanges();

  pollTimer = setInterval(pollForChanges, pollInterval);
};

export const stopPolling = (): void => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isPolling = false;
  onNewChanges = null;
};

export const getPollingStatus = (): boolean => isPolling;

loadLastSeenIds();
