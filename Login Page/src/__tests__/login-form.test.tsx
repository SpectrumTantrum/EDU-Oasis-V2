import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginCard } from "@/components/LoginCard";
import { AuthResult } from "@/lib/mockAuth";

const baseStatus = { type: "info" as const, message: "提示" };

describe("LoginCard", () => {
  it("Display necessary errors and prevent submission", async () => {
    const onLogin = vi
      .fn<(payload: { email: string; password: string; remember: boolean }) => Promise<AuthResult>>()
      .mockResolvedValue({ ok: false, message: "noop" });
    render(<LoginCard onLogin={onLogin} status={baseStatus} attempts={0} reducedMotion={false} />);

    const submitBtn = screen.getByRole("button", { name: "Login" });
    await userEvent.click(submitBtn);

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getAllByText(/Necessary/)).toHaveLength(2);
    expect(screen.getByLabelText("Account / Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("Success submission displays success status", async () => {
    const onLogin = vi.fn(async () => ({ ok: true, message: "ok" }));
    render(<LoginCard onLogin={onLogin} status={baseStatus} attempts={0} reducedMotion={false} />);

    await userEvent.type(screen.getByLabelText("Account / Email"), "pilot@oasis.ed");
    await userEvent.type(screen.getByLabelText("Password"), "pixelpass");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(onLogin).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: /Success/ })).toBeInTheDocument());
  });

  it("Error state displays hint and attempt count", () => {
    render(
      <LoginCard
        onLogin={vi.fn()}
        status={{ type: "error", message: "Account or password error", lockHint: "Reset password" }}
        attempts={2}
        reducedMotion={true}
      />
    );

    expect(screen.getByText(/Attempts: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Account or password error/)).toBeInTheDocument();
  });
});
