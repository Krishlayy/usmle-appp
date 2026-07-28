import { render, screen } from "@testing-library/react"
import HomePage from "../src/app/page"
import { describe, it, expect } from "vitest"

describe("HomePage", () => {
  it("renders the hero heading and primary CTA", () => {
    render(<HomePage />)

    expect(
      screen.getByRole("heading", { name: /master\s*medical concepts/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /explore question banks/i })
    ).toBeInTheDocument()
  })
})
