// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Supabase client mock ───────────────────────────────────────────────────────
const mockSignInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

import { GoogleButton } from "./GoogleButton";

// ─────────────────────────────────────────────────────────────────────────────

describe("GoogleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: OAuth call starts the redirect flow (no error, no return value needed)
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the default label", () => {
    render(<GoogleButton />);
    expect(screen.getByRole("button")).toHaveTextContent("Continue with Google");
  });

  it("renders a custom label", () => {
    render(<GoogleButton label="Sign up with Google" />);
    expect(screen.getByRole("button")).toHaveTextContent("Sign up with Google");
  });

  it("button is enabled on initial render", () => {
    render(<GoogleButton />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does not show an error message on initial render", () => {
    render(<GoogleButton />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  // ── OAuth call ─────────────────────────────────────────────────────────────

  it("calls signInWithOAuth with provider=google on click", async () => {
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledOnce();
    });

    const [call] = mockSignInWithOAuth.mock.calls;
    expect(call[0].provider).toBe("google");
  });

  it("includes the /auth/callback redirect URL", async () => {
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(mockSignInWithOAuth).toHaveBeenCalledOnce());

    const options = mockSignInWithOAuth.mock.calls[0][0].options;
    expect(options.redirectTo).toMatch(/\/auth\/callback/);
  });

  it("passes access_type=offline and prompt=select_account", async () => {
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(mockSignInWithOAuth).toHaveBeenCalledOnce());

    const { queryParams } = mockSignInWithOAuth.mock.calls[0][0].options;
    expect(queryParams.access_type).toBe("offline");
    expect(queryParams.prompt).toBe("select_account");
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it("disables the button while the OAuth call is in-flight", async () => {
    // Never resolves so we can inspect the in-flight state
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}));

    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("shows 'Redirecting to Google…' while loading", async () => {
    mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}));

    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Redirecting to Google");
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows an error message when signInWithOAuth returns an error", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "OAuth provider unavailable" },
    });

    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("OAuth provider unavailable")).toBeInTheDocument();
    });
  });

  it("re-enables the button after an error", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "Some error" },
    });

    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  it("shows a fallback error message when the call throws unexpectedly", async () => {
    mockSignInWithOAuth.mockRejectedValueOnce(new Error("Network failure"));

    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to start Google sign-in. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("clears the previous error when the button is clicked again", async () => {
    // First click: fails
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "First error" },
    });
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("First error"));

    // Second click: succeeds (redirect starts — no error expected)
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });
});
