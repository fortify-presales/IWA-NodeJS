export function apiResponse(status: string, message: string, data?: any) {
  return {
    status,
    message,
    data: data ?? null,
    timestamp: new Date().toISOString(),
  };
}
