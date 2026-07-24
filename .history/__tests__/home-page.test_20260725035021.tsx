import { render, screen } from "@testing-library/react"
import HomePage from "../src/app/page"

describe("HomePage", () => {
  it("renders the hero heading and primary CTA", () => {
    render(<HomePage />)

    expect(
      screen.getByRole("heading", { name: /master medical concepts/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /explore question banks|start learning/i })
    ).toBeInTheDocument()
  })
})
