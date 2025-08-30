import axios from "axios";
import { BookChange } from "../types";

const BASE_URL = "https://openlibrary.org";

// Add unique instance ID to track multiple instances
const INSTANCE_ID = Math.random().toString(36).substr(2, 9);
console.log(`🔧 BookPollingService instance created: ${INSTANCE_ID}`);

// Separate last seen IDs for each change type
let lastSeenAddBookId: string | null = null;
let lastSeenEditBookId: string | null = null;
let isPolling: boolean = false;
let pollTimer: NodeJS.Timeout | null = null;
let onNewChanges: ((changes: BookChange[]) => void) | null = null;

// Load last seen IDs from localStorage
const loadLastSeenIds = (): void => {
  try {
    const savedAddBook = localStorage.getItem("bookExplorer_lastSeenAddBookId");
    const savedEditBook = localStorage.getItem("bookExplorer_lastSeenEditBookId");
    
    if (savedAddBook) lastSeenAddBookId = savedAddBook;
    if (savedEditBook) lastSeenEditBookId = savedEditBook;
  } catch (error) {
    console.error("Error loading last seen IDs from localStorage:", error);
  }
};

// Save last seen IDs to localStorage
const saveLastSeenIds = (): void => {
  try {
    if (lastSeenAddBookId) {
      localStorage.setItem("bookExplorer_lastSeenAddBookId", lastSeenAddBookId);
    }
    if (lastSeenEditBookId) {
      localStorage.setItem("bookExplorer_lastSeenEditBookId", lastSeenEditBookId);
    }
  } catch (error) {
    console.error("Error saving last seen IDs to localStorage:", error);
  }
};

// Fetch changes of a specific kind
const fetchBookChanges = async (kind: "add-book" | "edit-book"): Promise<BookChange[]> => {
  try {
    const response = await axios.get<BookChange[]>(
      `${BASE_URL}/recentchanges/${kind}.json`,
      {
        params: {
          limit: 5,
          bot: false
        }
      }
    );

    const changes = Array.isArray(response.data) ? response.data : [];
    return changes;
  } catch (error) {
    console.error(`Error fetching ${kind} changes:`, error);
    return [];
  }
};

// Check for new changes based on last seen ID
const getNewChanges = (changes: BookChange[], lastSeenId: string | null, changeType: string): BookChange[] => {
  console.log(`🔍 Checking ${changeType} changes (lastSeenId: ${lastSeenId || 'null'})`);
  
  if (!lastSeenId) {
    // First time: return all changes but log for debugging
    console.log(`  - First time polling ${changeType}, returning all ${changes.length} changes as new`);
    return changes;
  }
  
  // Find new changes (before we hit the last seen ID)
  const newChanges: BookChange[] = [];
  for (const change of changes) {
    if (change.id === lastSeenId) {
      console.log(`  - Found last seen ID ${lastSeenId}, stopping here`);
      break;
    }
    newChanges.push(change);
  }
  
  console.log(`  - New ${changeType} changes found: ${newChanges.length}`);
  return newChanges;
};

// Poll for changes
const pollForChanges = async (): Promise<BookChange[]> => {
  try {
    console.log(`🔄 [${INSTANCE_ID}] Polling for changes...`);
    
    // ALWAYS read current localStorage values on every poll
    const currentLastSeenAddBookId = localStorage.getItem("bookExplorer_lastSeenAddBookId");
    const currentLastSeenEditBookId = localStorage.getItem("bookExplorer_lastSeenEditBookId");
    
    console.log(`  - localStorage lastSeenAddBookId: ${currentLastSeenAddBookId || 'null'}`);
    console.log(`  - localStorage lastSeenEditBookId: ${currentLastSeenEditBookId || 'null'}`);
    
    // Fetch both types separately
    const addBookChanges = await fetchBookChanges("add-book");
    const editBookChanges = await fetchBookChanges("edit-book");
    
    console.log(`📊 [${INSTANCE_ID}] Fetched: ${addBookChanges.length} add-book, ${editBookChanges.length} edit-book changes`);
    
    // Check for new changes based on CURRENT localStorage values (not stored variables)
    const newAddBookChanges = getNewChanges(addBookChanges, currentLastSeenAddBookId, "add-book");
    const newEditBookChanges = getNewChanges(editBookChanges, currentLastSeenEditBookId, "edit-book");
    
    console.log(`🔍 [${INSTANCE_ID}] New changes: ${newAddBookChanges.length} add-book, ${newEditBookChanges.length} edit-book`);
    
    // Combine all new changes
    const allNewChanges = [...newAddBookChanges, ...newEditBookChanges];
    console.log(`📋 [${INSTANCE_ID}] Total new changes: ${allNewChanges.length}`);
    
    // Notify if there are new changes
    if (allNewChanges.length > 0 && onNewChanges) {
      console.log(`🔔 [${INSTANCE_ID}] Calling notification callback...`);
      console.log(`  - Changes to notify: ${allNewChanges.length}`);
      console.log(`  - Callback type: ${typeof onNewChanges}`);
      
      // Prevent duplicate notifications by clearing callback temporarily
      const currentCallback = onNewChanges;
      onNewChanges = null;
      
      try {
        currentCallback(allNewChanges);
        console.log(`✅ [${INSTANCE_ID}] Notification callback executed successfully`);
      } catch (error) {
        console.error(`❌ [${INSTANCE_ID}] Error in notification callback:`, error);
      } finally {
        // Restore callback for future polls
        onNewChanges = currentCallback;
      }
    } else {
      console.log(`🔕 [${INSTANCE_ID}] No new changes or no callback`);
    }
    
    // Update the stored variables and localStorage
    if (addBookChanges.length > 0) {
      lastSeenAddBookId = addBookChanges[0].id;
      console.log(`📝 [${INSTANCE_ID}] Updated lastSeenAddBookId: ${lastSeenAddBookId}`);
    }
    if (editBookChanges.length > 0) {
      lastSeenEditBookId = editBookChanges[0].id;
      console.log(`📝 [${INSTANCE_ID}] Updated lastSeenEditBookId: ${lastSeenEditBookId}`);
    }
    
    // Save to localStorage
    saveLastSeenIds();
    
    return allNewChanges;
  } catch (error) {
    console.error(`❌ [${INSTANCE_ID}] Error polling for book changes:`, error);
    return [];
  }
};

// Start polling
export const startPolling = (callback: (changes: BookChange[]) => void, pollInterval: number = 10000): void => {
  if (isPolling) {
    console.log(`⚠️ [${INSTANCE_ID}] Polling already active, ignoring start request`);
    return;
  }
  
  // Additional safety check - if we already have a timer, don't start again
  if (pollTimer) {
    console.log(`⚠️ [${INSTANCE_ID}] Timer already exists, clearing and restarting`);
    clearInterval(pollTimer);
    pollTimer = null;
  }
  
  console.log(`🚀 [${INSTANCE_ID}] Starting book polling...`);
  console.log(`  - Callback function: ${typeof callback}`);
  console.log(`  - Previous isPolling: ${isPolling}`);
  console.log(`  - Previous pollTimer: ${pollTimer ? 'exists' : 'null'}`);
  
  onNewChanges = callback;
  isPolling = true;
  
  // Start immediately
  console.log(`🔄 [${INSTANCE_ID}] Triggering immediate first poll...`);
  pollForChanges();
  
  // Then poll every interval
  pollTimer = setInterval(pollForChanges, pollInterval);
  console.log(`⏰ [${INSTANCE_ID}] Set up polling interval: ${pollInterval}ms`);
  console.log(`✅ [${INSTANCE_ID}] Polling state: isPolling=${isPolling}, timer=${pollTimer ? 'set' : 'null'}`);
};

// Stop polling
export const stopPolling = (): void => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isPolling = false;
  onNewChanges = null;
};

// Get polling status
export const getPollingStatus = (): boolean => isPolling;

// Initialize
loadLastSeenIds();