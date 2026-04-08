import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CitationChips } from "./CitationChips";

describe("CitationChips", () => {
  it("renders nothing when no citations pass the filter", () => {
    const { container } = render(
      <CitationChips
        citations={[{ page: 1, excerpt: "" }]}
        onCitationClick={vi.fn()}
        allowedPages={new Set([1])}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Sources and chips for allowed pages with excerpts", () => {
    const onCitationClick = vi.fn();
    render(
      <CitationChips
        citations={[
          { page: 2, excerpt: "alpha beta" },
          { page: 99, excerpt: "ignored host page" },
        ]}
        onCitationClick={onCitationClick}
        allowedPages={new Set([2])}
      />,
    );
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /p\.2/ })).toBeInTheDocument();
    expect(screen.queryByText(/p\.99/)).not.toBeInTheDocument();
  });

  it("fires onCitationClick with the citation", () => {
    const onCitationClick = vi.fn();
    const citation = { page: 1, excerpt: "quote" };
    render(
      <CitationChips
        citations={[citation]}
        onCitationClick={onCitationClick}
        allowedPages={new Set([1])}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /p\.1/ }));
    expect(onCitationClick).toHaveBeenCalledTimes(1);
    expect(onCitationClick).toHaveBeenCalledWith(citation);
  });
});
