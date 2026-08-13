import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "./avatar";

describe("Avatar", () => {
  it("renders the image when a src is given", () => {
    render(<Avatar alt="Rakit Mimpi" src="https://example.test/a.png" />);
    expect(screen.getByRole("img", { name: "Rakit Mimpi" })).toBeInTheDocument();
  });

  it.each([
    ["Rakit Mimpi", "RM"],
    ["Nusantara Logistik Jaya", "NJ"],
    ["Bumi", "BU"],
  ])("derives initials from %s", (name, expected) => {
    render(<Avatar name={name} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("falls back to initials when the image fails to load", () => {
    render(<Avatar name="Rakit Mimpi" src="https://example.test/missing.png" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("RM")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("prefers explicit children over initials", () => {
    render(<Avatar name="Rakit Mimpi">★</Avatar>);
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it.each([
    ["sm", "size-6"],
    ["lg", "size-10"],
    ["3xl", "size-20"],
  ] as const)("sizes %s", (size, expected) => {
    const { container } = render(<Avatar name="A B" size={size} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("squares off when asked", () => {
    const { container } = render(<Avatar name="A B" shape="square" />);
    expect(container.firstElementChild).toHaveClass("rounded-md");
  });

  it.each([
    ["online", "bg-success"],
    ["busy", "bg-error"],
    ["away", "bg-warning"],
  ] as const)("paints the %s status dot", (status, expected) => {
    render(<Avatar name="A B" status={status} />);
    expect(screen.getByRole("status", { name: status })).toHaveClass(expected);
  });
});

describe("AvatarGroup", () => {
  const five = ["Ana Rai", "Budi Santo", "Citra Dewi", "Dian Putra", "Eka Sari"].map((name) => (
    <Avatar key={name} name={name} />
  ));

  it("renders every avatar when under the max", () => {
    render(<AvatarGroup max={10}>{five}</AvatarGroup>);
    expect(screen.getByText("AR")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("collapses the overflow into a +N chip", () => {
    render(<AvatarGroup max={3}>{five}</AvatarGroup>);
    expect(screen.getByText("AR")).toBeInTheDocument();
    expect(screen.queryByText("ES")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("overlaps the avatars", () => {
    const { container } = render(<AvatarGroup>{five}</AvatarGroup>);
    expect(container.firstElementChild).toHaveClass("-space-x-2");
  });
});
