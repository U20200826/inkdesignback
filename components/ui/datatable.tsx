// Generic reusable DataTable built on TanStack Table
// Supports: pagination, search, column sorting
"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable
} from "@tanstack/react-table";

import {useState} from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    ChevronUp,
    Search
} from "lucide-react";

// ─── Props ───────────────────────────────────────────────────────────────────

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchPlaceholder?: string;
    searchColumn?: string;
    pageSize?: number;
};

// ─── Page size options ────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DataTable<TData, TValue>({
                                                     columns,
                                                     data,
                                                     searchPlaceholder = "Search...",
                                                     searchColumn,
                                                     pageSize = 10
                                                 }:
                                                     Readonly<DataTableProps<TData, TValue>>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data, columns, state: {sorting, columnFilters, globalFilter},
        initialState: {pagination: {pageSize}},
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const {pageIndex, pageSize: currentPageSize} = table.getState().pagination;
    const totalRows = table.getFilteredRowModel().rows.length;
    const firstRow = pageIndex * currentPageSize + 1;
    const lastRow = Math.min((pageIndex + 1) * currentPageSize, totalRows);

    return (
        <div className="flex flex-col gap-4">
            {/* ── Toolbar: search + page size ── */}
            <div className="flex items-center justify-between gap-4">

                {/* Search input */}
                <div
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[260px] focus-within:border-brand transition-colors">
                    <Search size={13} className="text-gray-400 flex-shrink-0"/>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="text-xs outline-none text-gray-700 placeholder:text-gray-400 w-full bg-transparent"
                    />
                    {/* Clear search */}
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter("")}
                            className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Rows per page selector */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Rows per page</span>
                    <select
                        value={currentPageSize}
                        onChange={(e) =>
                            table.setPageSize(Number(e.target.value))
                        }
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-brand bg-white cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                            key={headerGroup.id}
                            className="border-b border-gray-100 bg-gray-50"
                        >
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none"
                                    style={{width: header.getSize()}}
                                >
                                    {header.isPlaceholder ? null : (
                                        // Sortable header
                                        <div
                                            className={`flex items-center gap-1.5 ${
                                                header.column.getCanSort()
                                                    ? "cursor-pointer hover:text-gray-700 transition-colors"
                                                    : ""
                                            }`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {/* Sort icon */}
                                            {header.column.getCanSort() && (
                                                <span className="text-gray-400">
                            {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp size={12}/>
                            ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown size={12}/>
                            ) : (
                                <ChevronsUpDown size={12}/>
                            )}
                          </span>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                    {table.getRowModel().rows.length === 0 ? (
                        // Empty state
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-16 text-center text-sm text-gray-400"
                            >
                                No results found
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-50/60 transition-colors group"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-4 py-3"
                                        style={{width: cell.column.getSize()}}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination bar ── */}
            <div className="flex items-center justify-between">

                {/* Row count info */}
                <p className="text-xs text-gray-400">
                    {totalRows === 0
                        ? "No results"
                        : `Showing ${firstRow}–${lastRow} of ${totalRows} results`}
                </p>

                {/* Pagination controls */}
                <div className="flex items-center gap-1">
                    {/* First page */}
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsLeft size={13}/>
                    </button>

                    {/* Previous page */}
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={13}/>
                    </button>

                    {/* Page number pills */}
                    {Array.from({length: table.getPageCount()}, (_, i) => i).map(
                        (pageNum) => {
                            // Show only nearby pages to avoid overflow
                            const currentPage = table.getState().pagination.pageIndex;
                            const isNearby =
                                pageNum === 0 ||
                                pageNum === table.getPageCount() - 1 ||
                                Math.abs(pageNum - currentPage) <= 1;

                            const isEllipsisBefore =
                                pageNum === 1 && currentPage > 3;
                            const isEllipsisAfter =
                                pageNum === table.getPageCount() - 2 &&
                                currentPage < table.getPageCount() - 4;

                            if (isEllipsisBefore || isEllipsisAfter) {
                                return (
                                    <span
                                        key={pageNum}
                                        className="w-7 h-7 flex items-center justify-center text-xs text-gray-400"
                                    >
                    …
                  </span>
                                );
                            }

                            if (!isNearby) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => table.setPageIndex(pageNum)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                        pageNum === currentPage
                                            ? "bg-brand text-white border border-brand"
                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        }
                    )}

                    {/* Next page */}
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={13}/>
                    </button>

                    {/* Last page */}
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsRight size={13}/>
                    </button>
                </div>
            </div>

        </div>
    )
}