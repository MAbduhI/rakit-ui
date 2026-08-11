import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  describe("offset mode", () => {
    it("derives the current page from offset and limit", () => {
      render(<Pagination limit={20} mode="offset" offset={40} onChange={vi.fn()} total={200} />);
      expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    });

    it("emits the next offset, not just the page", async () => {
      const onChange = vi.fn();
      render(<Pagination limit={20} mode="offset" offset={40} onChange={onChange} total={200} />);

      await userEvent.click(screen.getByRole("button", { name: "Next page" }));
      expect(onChange).toHaveBeenCalledWith({ mode: "offset", page: 4, offset: 60, limit: 20 });
    });

    it("survives a zero limit instead of dividing by it", () => {
      render(<Pagination limit={0} mode="offset" offset={0} onChange={vi.fn()} total={100} />);
      expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    });
  });

  describe("page mode", () => {
    it("emits the page and size", async () => {
      const onChange = vi.fn();
      render(<Pagination mode="page" onChange={onChange} page={2} pageSize={10} total={100} />);

      await userEvent.click(screen.getByRole("button", { name: "Page 5" }));
      expect(onChange).toHaveBeenCalledWith({ mode: "page", page: 5, pageSize: 10 });
    });

    it("disables the ends and does not emit past them", async () => {
      const onChange = vi.fn();
      const { rerender } = render(<Pagination mode="page" onChange={onChange} page={1} pageSize={10} total={100} />);
      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

      rerender(<Pagination mode="page" onChange={onChange} page={10} pageSize={10} total={100} />);
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores a click on the page already shown", async () => {
      const onChange = vi.fn();
      render(<Pagination mode="page" onChange={onChange} page={3} pageSize={10} total={100} />);

      await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("jumps to a typed page on Enter", async () => {
      const onChange = vi.fn();
      render(<Pagination mode="page" onChange={onChange} page={1} pageSize={10} showJump total={100} />);

      const jump = screen.getByLabelText("Go to page");
      await userEvent.clear(jump);
      await userEvent.type(jump, "7{Enter}");
      expect(onChange).toHaveBeenCalledWith({ mode: "page", page: 7, pageSize: 10 });
    });

    it("clamps a typed page beyond the last one", async () => {
      const onChange = vi.fn();
      render(<Pagination mode="page" onChange={onChange} page={1} pageSize={10} showJump total={100} />);

      const jump = screen.getByLabelText("Go to page");
      await userEvent.clear(jump);
      await userEvent.type(jump, "999{Enter}");
      expect(onChange).toHaveBeenCalledWith({ mode: "page", page: 10, pageSize: 10 });
    });
  });

  describe.each(["cursor", "keyset", "time"] as const)("%s mode", (mode) => {
    it("emits the direction and the matching token", async () => {
      const onChange = vi.fn();
      render(
        <Pagination
          mode={mode}
          nextToken="tok-next"
          onChange={onChange}
          previousToken="tok-prev"
          label="Showing 21–40"
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: /Next/ }));
      expect(onChange).toHaveBeenCalledWith({ mode, direction: "next", token: "tok-next" });

      await userEvent.click(screen.getByRole("button", { name: /Previous/ }));
      expect(onChange).toHaveBeenCalledWith({ mode, direction: "previous", token: "tok-prev" });
    });

    it("renders no page numbers — the total is unknown", () => {
      render(<Pagination mode={mode} nextToken="tok" onChange={vi.fn()} />);
      expect(screen.queryByRole("button", { name: /^Page / })).not.toBeInTheDocument();
    });

    it("infers availability from the tokens", () => {
      render(<Pagination mode={mode} nextToken="tok" onChange={vi.fn()} previousToken={null} />);
      expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Next/ })).toBeEnabled();
    });

    it("lets hasNext override the inference, for a token-less API", () => {
      render(<Pagination hasNext hasPrevious mode={mode} onChange={vi.fn()} />);
      expect(screen.getByRole("button", { name: /Previous/ })).toBeEnabled();
      expect(screen.getByRole("button", { name: /Next/ })).toBeEnabled();
    });

    it("shows the label between the buttons", () => {
      render(<Pagination label="Showing 21–40" mode={mode} onChange={vi.fn()} />);
      expect(screen.getByText("Showing 21–40")).toBeInTheDocument();
    });
  });

  it("disables everything when disabled", () => {
    render(<Pagination disabled mode="page" onChange={vi.fn()} page={3} pageSize={10} total={100} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("labels itself as navigation", () => {
    render(<Pagination mode="page" onChange={vi.fn()} page={1} pageSize={10} total={50} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });
});
