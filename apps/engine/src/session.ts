export type Role = "user" | "assistant" | "system";

export interface SessionMessage {
  role: Role;
  content: string;
  ts: number;
}

export interface EphemeralSession {
  id: string;
  startedAt: number;
  messages: SessionMessage[];
}

export function createSession(): EphemeralSession {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    messages: [],
  };
}

export function appendMessage(
  session: EphemeralSession,
  role: Role,
  content: string
): EphemeralSession {
  session.messages.push({ role, content, ts: Date.now() });
  return session;
}

export function destroySession(session: EphemeralSession): void {
  session.messages.length = 0;
}
