import { matchesSchema, type Schema } from "../transport/schema";

/** The session user. The server contract and the client view are the same shape. */
export type User = { id: number };

// Client wire shapes deliberately do not import server types.
const sessionSchema: Schema = {
  type: "object",
  required: ["user"],
  additionalProperties: false,
  properties: {
    user: {
      type: "object",
      required: ["id"],
      additionalProperties: false,
      properties: { id: { type: "integer" } },
    },
  },
};

const loginSchema: Schema = {
  type: "object",
  required: ["authorizationUrl"],
  additionalProperties: false,
  properties: { authorizationUrl: { type: "string" } },
};

export async function readSessionResponse(response: Response): Promise<User | null> {
  if (response.status === 401) return null;
  if (response.status !== 200) throw new Error("Authentication unavailable");

  const body: unknown = await response.json();
  if (!matchesSchema(body, sessionSchema)) throw new Error("Invalid session response");
  return (body as { user: User }).user;
}

export async function readLoginResponse(response: Response): Promise<string> {
  if (response.status !== 200) throw new Error("Authentication unavailable");

  const body: unknown = await response.json();
  if (!matchesSchema(body, loginSchema)) throw new Error("Invalid login response");
  const url = new URL((body as { authorizationUrl: string }).authorizationUrl);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Invalid login response");
  }
  return url.href;
}

export async function readLogoutResponse(response: Response): Promise<void> {
  if (response.status !== 204 && response.status !== 401) {
    throw new Error("Sign-out unavailable");
  }
}
