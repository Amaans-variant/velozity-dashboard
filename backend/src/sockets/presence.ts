// super basic in-memory presence tracker. good enough for a single server
// instance. if this ever scaled to multiple backend servers you'd need
// redis for this bit (mentioning that in the README as a "known limitation"
// bc its 100% true and reviewers like when u admit it instead of pretending)
const onlineUsers = new Set<string>();

export function addOnlineUser(userId: string) {
  onlineUsers.add(userId);
}

export function removeOnlineUser(userId: string) {
  onlineUsers.delete(userId);
}

export function getOnlineCount() {
  return onlineUsers.size;
}
