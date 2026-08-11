import type { ReactNode } from "react";
import { cn } from "../../../utils";
import { Button, type ButtonProps } from "../button";
import { Icon } from "../icon";
import { Input } from "../input";
import { getPageRange } from "./page-range";

/**
 * The five strategies differ in what the server needs back, not in what the
 * user sees. `offset` and `page` know the total, so they render jumpable page
 * numbers. `cursor`, `keyset` and `time` carry an opaque token and can only
 * step, so they render Previous / Next.
 */
export type PaginationMode = "offset" | "page" | "cursor" | "keyset" | "time";

/** A cursor string, a sort key, or a timestamp — whatever the mode carries. */
export type PaginationToken = string | number | null;

export interface PaginationOffsetChange {
  mode: "offset";
  page: number;
  offset: number;
  limit: number;
}

export interface PaginationPageChange {
  mode: "page";
  page: number;
  pageSize: number;
}

export interface PaginationTokenChange {
  mode: "cursor" | "keyset" | "time";
  direction: "next" | "previous";
  token: PaginationToken;
}

export type PaginationChange = PaginationOffsetChange | PaginationPageChange | PaginationTokenChange;

interface PaginationCommonProps {
  className?: string;
  disabled?: boolean;
  size?: ButtonProps["size"];
}

interface NumberedCommonProps extends PaginationCommonProps {
  total: number;
  /** Pages shown either side of the current one. Defaults to 1. */
  siblingCount?: number;
  /** Adds a "go to page" field, for when the page count is large. */
  showJump?: boolean;
}

export interface PaginationOffsetProps extends NumberedCommonProps {
  mode: "offset";
  offset: number;
  limit: number;
  onChange: (change: PaginationOffsetChange) => void;
}

export interface PaginationPageProps extends NumberedCommonProps {
  mode: "page";
  page: number;
  pageSize: number;
  onChange: (change: PaginationPageChange) => void;
}

export interface PaginationTokenProps extends PaginationCommonProps {
  mode: "cursor" | "keyset" | "time";
  /** Token for the next page — `nextCursor`, the last row's sort key, or a timestamp. */
  nextToken?: PaginationToken;
  previousToken?: PaginationToken;
  /** Defaults to whether the matching token is non-null. */
  hasNext?: boolean;
  hasPrevious?: boolean;
  /** Optional status between the buttons, e.g. "Showing 21–40". */
  label?: ReactNode;
  onChange: (change: PaginationTokenChange) => void;
}

export type PaginationProps = PaginationOffsetProps | PaginationPageProps | PaginationTokenProps;

const isNumbered = (props: PaginationProps): props is PaginationOffsetProps | PaginationPageProps =>
  props.mode === "offset" || props.mode === "page";

export function Pagination(props: PaginationProps) {
  const { className, disabled = false, size = "sm" } = props;

  if (!isNumbered(props)) {
    const hasPrevious = props.hasPrevious ?? props.previousToken != null;
    const hasNext = props.hasNext ?? props.nextToken != null;

    return (
      <nav aria-label="Pagination" className={cn("flex items-center gap-2", className)}>
        <Button
          disabled={disabled || !hasPrevious}
          onClick={() =>
            props.onChange({ mode: props.mode, direction: "previous", token: props.previousToken ?? null })
          }
          size={size}
          variant="outline"
        >
          <Icon name="chevron-left" size="sm" />
          Previous
        </Button>
        {props.label ? <span className="px-1 text-secondary text-sm">{props.label}</span> : null}
        <Button
          disabled={disabled || !hasNext}
          onClick={() => props.onChange({ mode: props.mode, direction: "next", token: props.nextToken ?? null })}
          size={size}
          variant="outline"
        >
          Next
          <Icon name="chevron-right" size="sm" />
        </Button>
      </nav>
    );
  }

  // A zero page size would make every derived number Infinity or NaN.
  const pageSize = Math.max(1, props.mode === "offset" ? props.limit : props.pageSize);
  const page = props.mode === "offset" ? Math.floor(Math.max(0, props.offset) / pageSize) + 1 : props.page;
  const totalPages = Math.max(1, Math.ceil(Math.max(0, props.total) / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);

  const go = (target: number) => {
    const next = Math.min(Math.max(target, 1), totalPages);
    if (next === current) {
      return;
    }
    if (props.mode === "offset") {
      props.onChange({ mode: "offset", page: next, offset: (next - 1) * pageSize, limit: pageSize });
      return;
    }
    props.onChange({ mode: "page", page: next, pageSize });
  };

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <Button
        aria-label="Previous page"
        className="aspect-square p-0"
        disabled={disabled || current <= 1}
        onClick={() => go(current - 1)}
        size={size}
        variant="outline"
      >
        <Icon name="chevron-left" size="sm" />
      </Button>

      {getPageRange(current, totalPages, props.siblingCount).map((slot) =>
        typeof slot === "number" ? (
          <Button
            key={slot}
            aria-current={slot === current ? "page" : undefined}
            aria-label={`Page ${slot}`}
            className="aspect-square p-0 tabular-nums"
            disabled={disabled}
            onClick={() => go(slot)}
            size={size}
            variant={slot === current ? "primary" : "ghost"}
          >
            {slot}
          </Button>
        ) : (
          <span key={slot} aria-hidden className="px-1 text-secondary text-sm">
            …
          </span>
        ),
      )}

      <Button
        aria-label="Next page"
        className="aspect-square p-0"
        disabled={disabled || current >= totalPages}
        onClick={() => go(current + 1)}
        size={size}
        variant="outline"
      >
        <Icon name="chevron-right" size="sm" />
      </Button>

      {props.showJump ? (
        <Input
          // Remounts when the page changes elsewhere, so the field follows it
          // without needing to be a controlled input.
          key={current}
          aria-label="Go to page"
          className="h-8 text-center tabular-nums"
          containerClassName="ml-2 w-16"
          defaultValue={current}
          disabled={disabled}
          max={totalPages}
          min={1}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              go(Number(event.currentTarget.value));
            }
          }}
          type="number"
        />
      ) : null}
    </nav>
  );
}
