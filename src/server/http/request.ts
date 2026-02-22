export const isJsonRequest = (request: Request) =>
  request.headers.get("content-type")?.includes("application/json") ?? false;

export const parseJsonSafely = async (
  request: Request,
): Promise<unknown | null> => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};
