import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe('4. API & Integration Tests - Healthcheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should_return_200_ok_for_healthcheck_endpoint', async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([{ '?column?': 1 }]);

    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('healthy');
    expect(body.services.database).toBe('connected');
    expect(typeof body.latencyMs).toBe('number');
  });

  it('should_handle_api_server_downtime_gracefully', async () => {
    (prisma.$queryRaw as any).mockRejectedValueOnce(new Error('Connection refused'));

    const request = new Request('http://localhost:3000/api/health');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('unhealthy');
    expect(body.services.database).toBe('disconnected');
    expect(body.error).toContain('Connection refused');
  });
});
