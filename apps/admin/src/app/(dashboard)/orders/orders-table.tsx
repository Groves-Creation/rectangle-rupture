"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrdersAction } from "@/lib/actions/orders";
import type { SerializedError } from "@/lib/api/errors";
import type { AuthStore, OrderSummary, OrdersResponse } from "@/lib/api/types";
import { formatDateTime, formatQuantity } from "@/lib/format";
import { compareMoney, formatMoney } from "@/lib/money";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";

const ALL = "all";

const columnHelper = createColumnHelper<OrderSummary>();

export interface OrdersTableProps {
  stores: AuthStore[];
  initialData: OrdersResponse | null;
}

export function OrdersTable({ stores, initialData }: OrdersTableProps) {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "submittedAt", desc: true },
  ]);

  const unfiltered = storeId === ALL && status === ALL;

  const query = useQuery<OrdersResponse, Error>({
    queryKey: ["orders", { storeId, status }],
    queryFn: async () => {
      const result = await listOrdersAction({
        storeId: storeId === ALL ? undefined : storeId,
        status: status === ALL ? undefined : status,
      });
      if (!result.ok) {
        const failure = new Error(result.error.message);
        failure.name = result.error.code;
        throw failure;
      }
      return result.data;
    },
    // The server already fetched exactly this (unfiltered) page.
    initialData: unfiltered && initialData ? initialData : undefined,
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => query.data?.items ?? [], [query.data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order",
        cell: (info) => (
          <Link
            href={`/orders/${info.row.original.id}`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            onClick={(event) => event.stopPropagation()}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("storeName", { header: "Store" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <OrderStatusBadge status={info.getValue()} size="sm" />,
        enableSorting: false,
      }),
      columnHelper.accessor("orderTotal", {
        header: "Total",
        // Money stays a string: sorted by decimal comparison, never by float.
        sortingFn: (a, b) =>
          compareMoney(a.original.orderTotal, b.original.orderTotal),
        cell: (info) => (
          <span className="tabular-nums">{formatMoney(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("lineCount", {
        header: "Lines",
        cell: (info) => (
          <span className="tabular-nums">{formatQuantity(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("submittedAt", {
        header: "Submitted",
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDateTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("submittedByName", { header: "Submitted by" }),
    ],
    [],
  );

  // TanStack Table returns intentionally unstable callbacks; React Compiler
  // safely skips this component instead of memoizing stale table state.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const error: SerializedError | null = query.isError
    ? { code: query.error.name, message: query.error.message }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store-filter" className="text-xs text-muted-foreground">
            Store
          </Label>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger id="store-filter" className="w-56">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.code} — {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter" className="w-56">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(storeId !== ALL || status !== ALL) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setStoreId(ALL);
              setStatus(ALL);
            }}
          >
            Clear filters
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          {query.isFetching ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          <span aria-live="polite">
            {query.data
              ? `${formatQuantity(rows.length)} of ${formatQuantity(query.data.total)} orders`
              : "—"}
          </span>
        </div>
      </div>

      {error ? <ApiErrorNotice error={error} /> : null}

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 rounded-sm uppercase tracking-wide hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          ) : (
                            <ChevronsUpDown
                              className="size-3 opacity-40"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {sorted === "asc"
                              ? "sorted ascending"
                              : sorted === "desc"
                                ? "sorted descending"
                                : "not sorted"}
                          </span>
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {query.isPending && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No orders match these filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/orders/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
