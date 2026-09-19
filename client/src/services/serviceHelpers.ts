/** Mock latency keeps page behavior realistic while every response remains local and fictional. */
export function wait(milliseconds = 350): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
