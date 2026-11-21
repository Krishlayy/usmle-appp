import { render, screen } from "@testing-library/react"
import HomePage from "../src/app/page"
import { describe, it, expect, vi } from "vitest"

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

describe("HomePage", () => {
  it("renders the hero heading and primary CTA", () => {
    render(<HomePage />)

    expect(
      screen.getByRole("heading", { level: 1, name: /master medical concepts/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /explore question banks/i })
    ).toBeInTheDocument()
  })
})
