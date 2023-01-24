export const fetcher = async (url: string, method: string, data?: {}) => {
  return await fetch(window.location.origin + url, {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
}
