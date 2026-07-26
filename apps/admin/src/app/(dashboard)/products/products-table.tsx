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
import { ImageIcon, LoaderCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ApiErrorNotice } from "@/components/api-error-notice";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCatalogAction } from "@/lib/actions/catalog";
import type { SerializedError } from "@/lib/api/errors";
import type {
  AuthStore,
  CatalogIngestMetadata,
  CatalogItem,
  CatalogResponse,
} from "@/lib/api/types";
import { formatQuantity } from "@/lib/format";
import { compareMoney, formatMoney } from "@/lib/money";
import { ProductIngestDialog } from "./product-ingest-dialog";

const columnHelper = createColumnHelper<CatalogItem>();

export interface ProductsTableProps {
  storeId: string;
  stores: AuthStore[];
  initialData: CatalogResponse | null;
  ingestMetadata: CatalogIngestMetadata | null;
}

export function ProductsTable({
  storeId,
  initialData,
  ingestMetadata,
}: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const trimmedSearch = search.trim();

  const query = useQuery<CatalogResponse, Error>({
    queryKey: ["catalog", { storeId, search: trimmedSearch }],
    queryFn: async () => {
      const result = await listCatalogAction({
        storeId,
        search: trimmedSearch === "" ? undefined : trimmedSearch,
      });
      if (!result.ok) {
        const failure = new Error(result.error.message);
        failure.name = result.error.code;
        throw failure;
      }
      return result.data;
    },
    initialData: trimmedSearch === "" && initialData ? initialData : undefined,
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => query.data?.items ?? [], [query.data]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "image",
        header: "",
        cell: ({ row }) => (
          <span
            role="img"
            aria-label={
              row.original.imageUrl
                ? `${row.original.name} product image`
                : `${row.original.name} has no product image`
            }
            className="flex size-10 items-center justify-center rounded-md bg-muted bg-cover bg-center"
            style={
              row.original.imageUrl
                ? { backgroundImage: `url("${row.original.imageUrl}")` }
                : undefined
            }
          >
            {row.original.imageUrl ? null : (
              <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
        ),
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Product",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium">{info.getValue()}</span>
            <span className="text-xs text-muted-foreground">
              {info.row.original.variantName}
              {info.row.original.isAgeRestricted ? " · age restricted" : ""}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("brandName", { header: "Brand" }),
      columnHelper.accessor("categoryName", { header: "Category" }),
      columnHelper.accessor("unitPrice", {
        header: "Unit price",
        sortingFn: (a, b) =>
          compareMoney(a.original.unitPrice, b.original.unitPrice),
        cell: (info) => (
          <span className="tabular-nums">{formatMoney(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("casePrice", {
        header: "Case price",
        sortingFn: (a, b) =>
          compareMoney(a.original.casePrice, b.original.casePrice),
        cell: (info) => (
          <span className="tabular-nums">{formatMoney(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("unitsPerCase", {
        header: "Units / case",
        cell: (info) => (
          <span className="tabular-nums">{formatQuantity(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("availableAtWarehouse", {
        header: "Available",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={
                value <= 0
                  ? "font-medium tabular-nums text-destructive"
                  : "tabular-nums"
              }
            >
              {formatQuantity(value)}
            </span>
          );
        },
      }),
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
          <Label
            htmlFor="catalog-search"
            className="text-xs text-muted-foreground"
          >
            Search
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="catalog-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, SKU or brand"
              className="w-72 pl-8"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          {query.isFetching ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          <span aria-live="polite">
            {query.data
              ? `${formatQuantity(rows.length)} of ${formatQuantity(query.data.total)} items`
              : "—"}
          </span>
          {ingestMetadata ? (
            <ProductIngestDialog metadata={ingestMetadata} />
          ) : null}
        </div>
      </div>

      {error ? <ApiErrorNotice error={error} /> : null}

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  Loading catalog…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No catalog items found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
