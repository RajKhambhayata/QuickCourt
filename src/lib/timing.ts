import { NextResponse } from 'next/server';

/**
 * Wraps an async function with timing instrumentation.
 * Logs duration to console and adds Server-Timing header to response.
 * 
 * @param name - Name for the timing metric (e.g., "db", "api", "render")
 * @param fn - Async function to measure
 * @returns Result of the function with timing metadata
 */
export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (duration > 100) {
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Enhances a NextResponse with Server-Timing header.
 * Call this before returning from API routes.
 * 
 * @param response - NextResponse to enhance
 * @param timings - Array of { name, duration } objects
 * @returns Enhanced NextResponse
 */
export function withServerTiming(
  response: NextResponse,
  timings: Array<{ name: string; duration: number }>
): NextResponse {
  const timingHeader = timings
    .map(t => `${t.name};dur=${t.duration.toFixed(2)}`)
    .join(', ');
  
  response.headers.set('Server-Timing', timingHeader);
  return response;
}

/**
 * Higher-order wrapper for API route handlers.
 * Automatically adds Server-Timing header to response.
 * 
 * Usage:
 * export const GET = withTimingHandler('my-route', async (req) => {
 *   // your handler logic
 *   return NextResponse.json(data);
 * });
 */
export function withTimingHandler(
  name: string,
  handler: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    const start = performance.now();
    const response = await handler(req, ...args);
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    }
    
    response.headers.set('Server-Timing', `${name};dur=${duration.toFixed(2)}`);
    return response;
  };
}
