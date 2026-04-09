export type LocalMessageUser = {
  id: string;
  username: string;
  image?: string | null;
};

export type LocalMessageRecord = {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
  recipientId: string;
  sender: LocalMessageUser;
  recipient: LocalMessageUser;
};

declare global {
  var __localMessages: LocalMessageRecord[] | undefined;
}

function getStore() {
  if (!global.__localMessages) {
    global.__localMessages = [];
  }
  return global.__localMessages;
}

export function addLocalMessage(input: {
  body: string;
  sender: LocalMessageUser;
  recipient: LocalMessageUser;
}) {
  const createdAt = new Date().toISOString();
  const record: LocalMessageRecord = {
    id: `msg_local_${Math.random().toString(36).slice(2, 10)}`,
    body: input.body.trim(),
    createdAt,
    readAt: null,
    senderId: input.sender.id,
    recipientId: input.recipient.id,
    sender: input.sender,
    recipient: input.recipient,
  };
  const store = getStore();
  store.unshift(record);
  return record;
}

export function listLocalMessagesForUser(userId: string) {
  return getStore().filter(
    (entry) => entry.senderId === userId || entry.recipientId === userId,
  );
}

export function markLocalMessagesRead(recipientId: string, withUserId: string) {
  const now = new Date().toISOString();
  for (const entry of getStore()) {
    if (
      entry.recipientId === recipientId &&
      entry.senderId === withUserId &&
      entry.readAt === null
    ) {
      entry.readAt = now;
    }
  }
}
