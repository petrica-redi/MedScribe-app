import { vi, describe, it, expect, beforeEach } from "vitest";

// ── Supabase mock ──────────────────────────────────────────────────────────────
const mockExchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}));

// ── Next.js mock (capture redirects without needing the full Next runtime) ─────
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => ({ status: 307, headers: { location: url.toString() } }),
  },
}));

// Import after mocks are set up
const { GET } = await import("./route");

// ─────────────────────────────────────────────────────────────────────────────

function makeRequest(path: string): Request {
  return new Request(`https://scriva.doctor${path}`);
}

function locationOf(response: Awaited<ReturnType<typeof GET>>): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any).headers.location as string;
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Missing / invalid code ─────────────────────────────────────────────────

  it("redirects to /auth/signin when no code is present", async () => {
    const res = await GET(makeRequest("/auth/callback"));
    expect(locationOf(res)).toContain("/auth/signin");
    expect(locationOf(res)).toContain("missing_code");
  });

  it("never calls Supabase when the code is absent", async () => {
    await GET(makeRequest("/auth/callback"));
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  // ── Provider error params ──────────────────────────────────────────────────

  it("redirects to /auth/signin when Google returns an error param", async () => {
    const res = await GET(makeRequest("/auth/callback?error=server_error"));
    expect(locationOf(res)).toContain("/auth/signin");
    expect(locationOf(res)).toContain("error=");
  });

  it("converts access_denied into a friendly 'Sign-in was cancelled.' message", async () => {
    const res = await GET(makeRequest("/auth/callback?error=access_denied"));
    const location = decodeURIComponent(locationOf(res));
    expect(location).toContain("Sign-in was cancelled.");
    expect(location).not.toContain("access_denied");
  });

  it("prefers error_description over error param", async () => {
    const res = await GET(
      makeRequest("/auth/callback?error=server_error&error_description=Something+went+wrong")
    );
    expect(locationOf(res)).toContain("Something");
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  // ── Supabase code exchange ─────────────────────────────────────────────────

  it("calls exchangeCodeForSession with the supplied code", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    await GET(makeRequest("/auth/callback?code=abc123"));
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc123");
  });

  it("redirects to /dashboard on successful exchange", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await GET(makeRequest("/auth/callback?code=abc123"));
    expect(locationOf(res)).toContain("/dashboard");
  });

  it("redirects to ?next= path on success when path is safe", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await GET(makeRequest("/auth/callback?code=abc123&next=/patients"));
    expect(locationOf(res)).toContain("/patients");
  });

  it("falls back to /dashboard when Supabase exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      error: { message: "JWT error" },
    });
    const res = await GET(makeRequest("/auth/callback?code=bad_code"));
    const location = locationOf(res);
    expect(location).toContain("/auth/signin");
    expect(location).toContain("error=");
  });

  // ── Open-redirect protection ───────────────────────────────────────────────

  it("rejects an absolute URL in ?next= and falls back to /dashboard", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await GET(
      makeRequest("/auth/callback?code=abc&next=https%3A%2F%2Fevil.com%2Fsteal")
    );
    expect(locationOf(res)).toContain("/dashboard");
    expect(locationOf(res)).not.toContain("evil.com");
  });

  it("rejects a protocol-relative URL in ?next=", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await GET(makeRequest("/auth/callback?code=abc&next=//evil.com"));
    expect(locationOf(res)).toContain("/dashboard");
    expect(locationOf(res)).not.toContain("evil.com");
  });

  it("rejects a ?next= pointing back into /auth to prevent redirect loops", async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await GET(makeRequest("/auth/callback?code=abc&next=/auth/signin"));
    expect(locationOf(res)).toContain("/dashboard");
    expect(locationOf(res)).not.toContain("/auth/signin");
  });
});
