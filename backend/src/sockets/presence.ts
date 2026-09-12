// used to be a plain Set<string> here, which had a real bug: if a user
// had the app open in 2 tabs and closed just ONE of them, the whole user
// got removed from the online list even though tab #2 was still very
// much connected. thats exactly the "online count feels delayed/wrong"
// behavior - it wasnt actually delayed, it was just wrong, dropping
// people who were still there and not always catching people who left
//
// fix is a reference count instead of a boolean-ish membership check:
// each socket connection bumps the count for that userId, each
// disconnect decrements it, and we only actually consider them "gone"
// once the count hits zero (meaning ALL their tabs/devices disconnected)
const onlineUsers = new Map<string, number>();

export function addOnlineUser(userId: string) {
  onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
}

export function removeOnlineUser(userId: string) {
  const current = onlineUsers.get(userId) || 0;
  if (current <= 1) {
    onlineUsers.delete(userId); // last connection for this user just closed, actually gone now
  } else {
    onlineUsers.set(userId, current - 1); // still got other tabs open, dont drop them yet
  }
}

// still in-memory, single-server-instance only. if this app ever scaled
// to multiple backend servers, this map would need to live in redis
// instead so every instance agrees on who's actually online. noted as a
// known limitation in the readme, its a real one
export function getOnlineCount() {
  return onlineUsers.size;
}
