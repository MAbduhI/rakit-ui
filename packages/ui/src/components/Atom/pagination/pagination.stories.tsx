import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Pagination } from "./pagination";

/*
 * Typed against the props every mode shares rather than `typeof Pagination`.
 * `PaginationProps` is a discriminated union, and Storybook's inference
 * collapses a union to its first member — which would type every `render`
 * callback as offset-mode. Each story fixes its own `mode`, so the only
 * meaningful controls are the shared ones.
 */
interface SharedArgs {
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

// No `component` either — it would have to satisfy `ComponentType<SharedArgs>`.
// The trade-off is no auto-generated props table; the JSDoc on `PaginationProps`
// carries that instead.
const meta: Meta<SharedArgs> = {
  title: "Components/Atom/Pagination",
  tags: ["autodocs"],
  args: {
    size: "sm",
    disabled: false,
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<SharedArgs>;

/* Rows 1–200, paged by 20 — the same dataset behind every story below. */
const TOTAL = 200;
const PAGE_SIZE = 20;

/** `offset` + `limit`, the shape a SQL `LIMIT ? OFFSET ?` query wants back. */
export const Offset: Story = {
  render: (args) => {
    const [offset, setOffset] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <Pagination
          {...args}
          limit={PAGE_SIZE}
          mode="offset"
          offset={offset}
          onChange={(change) => setOffset(change.offset)}
          total={TOTAL}
        />
        <code className="text-secondary text-xs">
          LIMIT {PAGE_SIZE} OFFSET {offset}
        </code>
      </div>
    );
  },
};

/** `page` + `pageSize` — the same UI, a different payload. */
export const PageBased: Story = {
  name: "Page-based",
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <div className="flex flex-col gap-3">
        <Pagination
          {...args}
          mode="page"
          onChange={(change) => setPage(change.page)}
          page={page}
          pageSize={PAGE_SIZE}
          total={TOTAL}
        />
        <code className="text-secondary text-xs">
          ?page={page}&pageSize={PAGE_SIZE}
        </code>
      </div>
    );
  },
};

/** Past ~10 pages, clicking through is slower than typing a number. */
export const WithJump: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        {...args}
        mode="page"
        onChange={(change) => setPage(change.page)}
        page={page}
        pageSize={10}
        showJump
        total={5000}
      />
    );
  },
};

export const SiblingCount: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {([0, 1, 2, 3] as const).map((siblingCount) => (
        <div key={siblingCount} className="flex items-center gap-4">
          <code className="w-24 shrink-0 text-secondary text-xs">siblings {siblingCount}</code>
          <Pagination
            {...args}
            mode="page"
            onChange={() => {}}
            page={10}
            pageSize={PAGE_SIZE}
            siblingCount={siblingCount}
            total={1000}
          />
        </div>
      ))}
    </div>
  ),
};

/*
 * The three token strategies render identically — an opaque token can only step
 * forwards or backwards, and the total is usually unknown. Only the payload
 * differs, which is why they share one component.
 */
const cursors = [null, "eyJpZCI6MjB9", "eyJpZCI6NDB9", "eyJpZCI6NjB9"];

export const Cursor: Story = {
  render: (args) => {
    const [index, setIndex] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <Pagination
          {...args}
          label={`Page ${index + 1}`}
          mode="cursor"
          nextToken={index < cursors.length - 1 ? cursors[index + 1] : null}
          onChange={(change) => setIndex((i) => (change.direction === "next" ? i + 1 : i - 1))}
          previousToken={index > 0 ? cursors[index - 1] : null}
        />
        <code className="text-secondary text-xs">?after={cursors[index] ?? "—"}</code>
      </div>
    );
  },
};

/** Keyset (seek): the token is the last row's sort key, not an opaque blob. */
export const Keyset: Story = {
  render: (args) => {
    const [lastId, setLastId] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <Pagination
          {...args}
          hasNext={lastId < 180}
          hasPrevious={lastId > 0}
          label={`After id ${lastId}`}
          mode="keyset"
          nextToken={lastId + PAGE_SIZE}
          onChange={(change) => setLastId((id) => (change.direction === "next" ? id + PAGE_SIZE : id - PAGE_SIZE))}
          previousToken={lastId - PAGE_SIZE}
        />
        <code className="text-secondary text-xs">
          WHERE id &gt; {lastId} ORDER BY id LIMIT {PAGE_SIZE}
        </code>
      </div>
    );
  },
};

/** Time-based: the token is a timestamp, as in a feed or an audit log. */
export const TimeBased: Story = {
  name: "Time-based",
  render: (args) => {
    const [days, setDays] = useState(0);
    const stamp = `2026-08-${String(11 - days).padStart(2, "0")}T00:00:00Z`;
    return (
      <div className="flex flex-col gap-3">
        <Pagination
          {...args}
          hasNext={days < 6}
          hasPrevious={days > 0}
          label={stamp.slice(0, 10)}
          mode="time"
          nextToken={stamp}
          onChange={(change) => setDays((d) => (change.direction === "next" ? d + 1 : d - 1))}
          previousToken={stamp}
        />
        <code className="text-secondary text-xs">?before={stamp}</code>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Pagination {...args} mode="page" onChange={() => {}} page={3} pageSize={PAGE_SIZE} total={TOTAL} />
  ),
};
