type FeedbackStatus = "NEW" | "REVIEWED" | "PLANNED" | "CLOSED";

export type LocalFeedbackRecord = {
  id: string;
  userId: string | null;
  name: string | null;
  siteRating: number;
  contentRating: number;
  performanceRating: number;
  whatToAdd: string;
  whatToImprove: string | null;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
  user: null;
};

declare global {
  var __localFeedbackStore: LocalFeedbackRecord[] | undefined;
}

function getStore() {
  if (!global.__localFeedbackStore) {
    global.__localFeedbackStore = [];
  }
  return global.__localFeedbackStore;
}

export function createLocalFeedback(input: Omit<LocalFeedbackRecord, "id" | "status" | "createdAt" | "updatedAt" | "user">) {
  const now = new Date();
  const record: LocalFeedbackRecord = {
    id: `fb_local_${Math.random().toString(36).slice(2, 10)}`,
    ...input,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
    user: null,
  };
  const store = getStore();
  store.unshift(record);
  return record;
}

export function listLocalFeedback(status?: FeedbackStatus) {
  const items = getStore();
  if (!status) return items;
  return items.filter((entry) => entry.status === status);
}

export function updateLocalFeedbackStatus(id: string, status: FeedbackStatus) {
  const store = getStore();
  const found = store.find((entry) => entry.id === id);
  if (!found) return null;
  found.status = status;
  found.updatedAt = new Date();
  return found;
}
