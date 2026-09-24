import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  Inbox,
} from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import TableSort from "./TableSort";
import TableFilter from "./TableFilter";
import TableFilterDropdown from "./TableFilterDropdown";
import Pagination from "./Pagination";

/**
 * Universal, Reusable Table Component for GlamDesk
 *
 * Features:
 * - Declarative Column Definitions (`columns`)
 * - Built-in Search with auto-filtering across specified or all string fields
 * - Built-in Date Range Picker (auto-filters data when `dateField` is passed)
 * - Built-in Category/Status Filter Pills / Dropdown
 * - Built-in Sort Dropdown + Interactive Column Header Sorting
 * - Built-in Pagination with page size and item counter
 * - Built-in Empty State with automatic "Reset Filters" action
 * - Shimmer Skeleton Loading State
 * - Compact / Space-Efficient Density by default
 * - Interactive Row Click handling
 */
const Table = ({
  // Core Data & Columns
  columns = [],
  data = [],
  keyField = "id",
  onRowClick,
  compact = false,

  // Optional Header & Primary Actions
  title,
  icon: HeaderIcon,
  badge,
  actions,

  // Built-in Search
  searchable = true,
  searchPlaceholder = "Search records...",
  searchFields = [],
  searchValue: controlledSearchValue,
  onSearchChange: controlledOnSearchChange,

  // Built-in Date Range Filter
  dateField, // e.g. "eventDate"
  enableDateFilter = false,
  dateRange: controlledDateRange,
  onDateRangeChange: controlledOnDateRangeChange,

  // Built-in Filter Pills / Dropdown
  filterKey,
  filterOptions = [],
  filterMode = "pills", // "pills" | "dropdown"
  filterLabel = "Filter",
  filterValue: controlledFilterValue,
  onFilterChange: controlledOnFilterChange,

  // Built-in Dropdown Filter Popover (e.g. Location: Studio / Venue)
  filterDropdown,

  // Built-in Sort Dropdown
  sortOptions = [],
  defaultSortBy = "",
  defaultSortOrder = "asc",
  sortBy: controlledSortBy,
  sortOrder: controlledSortOrder,
  onSort: controlledOnSort,

  // Built-in Pagination (Default: 6 entries per page)
  pageSize = 6,
  itemLabel = "entries",

  // Loading & Empty States
  isLoading = false,
  loadingRowsCount = 6,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = "No records found",
  emptyMessage = "Try adjusting your search query or filters.",
  emptyAction,

  // Styling Customization
  className = "",
  tableClassName = "",
}) => {
  // ─── Internal State (used when uncontrolled) ────────────────────────────────
  const [internalSearch, setInternalSearch] = useState("");
  const [internalFilter, setInternalFilter] = useState("All");
  const [internalSortBy, setInternalSortBy] = useState(defaultSortBy);
  const [internalSortOrder, setInternalSortOrder] = useState(defaultSortOrder);
  const [internalDateRange, setInternalDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically reset to page 1 when new items are added to data
  const prevDataLengthRef = useRef(data.length);
  useEffect(() => {
    if (data.length > prevDataLengthRef.current) {
      setCurrentPage(1);
    }
    prevDataLengthRef.current = data.length;
  }, [data.length]);

  // Determine active search, filter, date range, and sort values
  const searchQuery =
    controlledSearchValue !== undefined ? controlledSearchValue : internalSearch;
  const activeFilter =
    controlledFilterValue !== undefined ? controlledFilterValue : internalFilter;
  const activeDateRange =
    controlledDateRange !== undefined ? controlledDateRange : internalDateRange;
  const activeSortBy =
    controlledSortBy !== undefined ? controlledSortBy : internalSortBy;
  const activeSortOrder =
    controlledSortOrder !== undefined ? controlledSortOrder : internalSortOrder;

  const handleSearchChange = (val) => {
    if (controlledOnSearchChange) {
      controlledOnSearchChange(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (val) => {
    if (controlledOnFilterChange) {
      controlledOnFilterChange(val);
    } else {
      setInternalFilter(val);
    }
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range) => {
    if (controlledOnDateRangeChange) {
      controlledOnDateRangeChange(range);
    } else {
      setInternalDateRange(range);
    }
    setCurrentPage(1);
  };

  const handleSortChange = (key, order) => {
    if (controlledOnSort) {
      controlledOnSort(key, order);
    } else {
      setInternalSortBy(key);
      setInternalSortOrder(order);
    }
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    handleSearchChange("");
    handleFilterChange("All");
    handleDateRangeChange({ startDate: "", endDate: "" });
    if (filterDropdown?.onChange) {
      filterDropdown.onChange("All");
    }
  };

  // ─── Filter & Search Processing ─────────────────────────────────────────────
  const processedData = useMemo(() => {
    let result = [...(data || [])];

    // 1. Filter Pills by filterKey
    if (filterKey && activeFilter && activeFilter !== "All") {
      result = result.filter((item) => {
        const itemVal = item[filterKey];
        if (typeof itemVal === "string") {
          return itemVal.toLowerCase() === activeFilter.toLowerCase();
        }
        return itemVal === activeFilter;
      });
    }

    // 2. Date Range Filtering
    if (dateField && (activeDateRange.startDate || activeDateRange.endDate)) {
      result = result.filter((item) => {
        const rawDate = item[dateField];
        if (!rawDate) return false;
        const dateStr = String(rawDate).split("T")[0]; // normalize to YYYY-MM-DD
        if (activeDateRange.startDate && dateStr < activeDateRange.startDate) {
          return false;
        }
        if (activeDateRange.endDate && dateStr > activeDateRange.endDate) {
          return false;
        }
        return true;
      });
    }

    // 3. Dropdown Filter (e.g. Location: Studio / Venue)
    if (
      filterDropdown &&
      filterDropdown.value &&
      filterDropdown.value !== "All" &&
      filterDropdown.value !== "All Locations"
    ) {
      const { key: fKey, value: fVal, filterFn } = filterDropdown;
      result = result.filter((item) => {
        if (typeof filterFn === "function") {
          return filterFn(item, fVal);
        }
        if (fKey) {
          const itemVal = item[fKey];
          if (itemVal === undefined || itemVal === null) return false;
          return String(itemVal).toLowerCase().includes(String(fVal).toLowerCase());
        }
        return true;
      });
    }

    // 3. Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((field) => {
            const val = item[field];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Fallback: search all primitive object values
        return Object.values(item).some(
          (val) =>
            val !== undefined &&
            val !== null &&
            (typeof val === "string" || typeof val === "number") &&
            String(val).toLowerCase().includes(q)
        );
      });
    }

    // 4. Sorting
    if (activeSortBy) {
      const matchingOption = sortOptions.find((opt) => opt.value === activeSortBy);
      if (matchingOption && typeof matchingOption.compare === "function") {
        result.sort(matchingOption.compare);
      } else {
        const sortCol = columns.find(
          (c) => c.key === activeSortBy || c.accessorKey === activeSortBy
        );
        const accessor = sortCol?.accessorKey || activeSortBy;

        result.sort((a, b) => {
          const aVal = a[accessor];
          const bVal = b[accessor];

          if (aVal === undefined || aVal === null) return 1;
          if (bVal === undefined || bVal === null) return -1;

          let comp = 0;
          if (typeof aVal === "number" && typeof bVal === "number") {
            comp = aVal - bVal;
          } else if (aVal instanceof Date && bVal instanceof Date) {
            comp = aVal.getTime() - bVal.getTime();
          } else {
            comp = String(aVal).localeCompare(String(bVal));
          }

          return activeSortOrder === "desc" ? -comp : comp;
        });
      }
    }

    return result;
  }, [
    data,
    filterKey,
    activeFilter,
    dateField,
    activeDateRange,
    searchQuery,
    searchFields,
    activeSortBy,
    activeSortOrder,
    sortOptions,
    columns,
  ]);

  // ─── Pagination Slice ───────────────────────────────────────────────────────
  const totalEntries = processedData.length;
  const totalPages = pageSize && pageSize > 0 ? Math.ceil(totalEntries / pageSize) : 1;
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const paginatedData = useMemo(() => {
    if (!pageSize || pageSize <= 0) return processedData;
    const start = (safePage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, safePage, pageSize]);

  // Dimensions & Padding
  const cellPadding = compact ? "py-1.5 px-3" : "py-3 sm:py-3.5 px-3.5 sm:px-4";
  const headerPadding = compact ? "py-1.5 px-3" : "py-2 sm:py-2.5 px-3.5 sm:px-4";

  const getAlignmentClass = (align) => {
    if (align === "right") return "text-right";
    if (align === "center") return "text-center";
    return "text-left";
  };

  const showDateFilter = Boolean(dateField || enableDateFilter);
  const hasToolbar =
    searchable ||
    showDateFilter ||
    (filterOptions && filterOptions.length > 0) ||
    (sortOptions && sortOptions.length > 0);

  return (
    <div className={`flex-1 flex flex-col min-h-0 space-y-2.5 ${className}`}>
      {/* 1. Optional Top Header Banner (Rendered only when title is explicitly provided) */}
      {title && (
        <div className="shrink-0 flex items-center justify-between gap-3 bg-glam-surface border border-glam-border/40 px-4 py-3 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {HeaderIcon && (
              <span className="p-1.5 rounded-xl bg-glam-accent/10 text-glam-accent shrink-0">
                <HeaderIcon size={18} />
              </span>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base sm:text-lg font-medium font-outfit text-glam-text tracking-tight truncate">
                {title}
              </h2>
              {badge !== undefined && (
                <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-glam-accent/10 text-glam-accent shrink-0">
                  {badge}
                </span>
              )}
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {/* 2. Unified Controls Toolbar matching Reference Design */}
      {hasToolbar && (
        <div className="space-y-2 shrink-0">
          {/* Row 1: Search Bar (Left) + Utility Action Icons (Right: Date Range & Sort) */}
          <div className="flex items-center justify-between gap-3">
            {searchable && (
              <div className="relative flex-1 max-w-sm sm:max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-3 text-glam-accent"
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10 pl-10 pr-9 rounded-full border border-glam-border/40 bg-glam-surface/90 text-xs sm:text-sm font-normal text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3.5 top-3 text-glam-text-muted hover:text-glam-text cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Utility action icon buttons on right */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {showDateFilter && (
                <DateRangePicker
                  startDate={activeDateRange.startDate}
                  endDate={activeDateRange.endDate}
                  onChange={handleDateRangeChange}
                  variant="icon"
                  compact={compact}
                />
              )}

              {sortOptions && sortOptions.length > 0 && (
                <TableSort
                  options={sortOptions}
                  value={activeSortBy}
                  onChange={(val) => handleSortChange(val, "asc")}
                  variant="icon"
                  compact={compact}
                />
              )}

              {filterDropdown && (
                <TableFilterDropdown {...filterDropdown} />
              )}
            </div>
          </div>

          {/* Row 2: Status Filter Pills (Left) & Primary Actions (Right: + New Appointment) */}
          {((filterOptions && filterOptions.length > 0) || (actions && !title)) && (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              {filterOptions && filterOptions.length > 0 && (
                <div className="flex-1 overflow-x-auto scrollbar-none min-w-0">
                  <TableFilter
                    options={filterOptions}
                    value={activeFilter}
                    onChange={handleFilterChange}
                    mode={filterMode}
                    label={filterLabel}
                    compact={compact}
                  />
                </div>
              )}

              {actions && !title && (
                <div className="shrink-0 ml-auto">{actions}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Luxury Table Card & States */}
      {isLoading ? (
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-glam-border/30 bg-glam-surface/90 backdrop-blur-md shadow-2xs">
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse ${tableClassName}`}>
              <thead>
                <tr className="border-b border-glam-border/30 bg-[#fbf4ee]/70 dark:bg-white/5 text-[10px] md:text-[11px] font-medium tracking-wider text-[#a67c52] dark:text-glam-accent uppercase">
                  {columns.map((col) => (
                    <th
                      key={col.key || col.accessorKey}
                      className={`${headerPadding} ${getAlignmentClass(col.align)} ${col.width || ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-glam-border/20 text-xs">
                {Array.from({ length: loadingRowsCount }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={`sk-${col.key}-${rIdx}`} className={`${cellPadding} align-middle`}>
                        <div className="h-3.5 bg-glam-surface-alt rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface/90 backdrop-blur-md border border-glam-border/30 rounded-2xl md:rounded-3xl text-center shadow-2xs flex-1">
          <div className="w-12 h-12 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <EmptyIcon size={24} />
          </div>
          <h3 className="text-base font-medium font-outfit text-glam-text">
            {emptyTitle}
          </h3>
          {emptyMessage && (
            <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
              {emptyMessage}
            </p>
          )}
          {emptyAction ? (
            <div className="mt-4">{emptyAction}</div>
          ) : (
            (searchQuery ||
              (activeFilter && activeFilter !== "All") ||
              activeDateRange.startDate ||
              activeDateRange.endDate) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-xs font-medium text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-glam-border/30 bg-glam-surface/90 backdrop-blur-md shadow-2xs">
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse ${tableClassName}`}>
              <thead>
                <tr className="border-b border-glam-border/30 bg-[#fbf4ee]/70 dark:bg-white/5 text-[11px] font-medium uppercase tracking-wider text-[#a67c52] dark:text-glam-accent">
                  {columns.map((col) => {
                    const colKey = col.key || col.accessorKey;

                    return (
                      <th
                        key={colKey}
                        className={`${headerPadding} ${getAlignmentClass(col.align)} ${
                          col.width || ""
                        } ${col.headerClassName || ""}`}
                      >
                        <span>{col.header}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-glam-border/15 text-xs">
                {paginatedData.map((row, rowIdx) => {
                  const rowKey = row[keyField] || `row-${rowIdx}`;

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick && onRowClick(row, rowIdx)}
                      className={`hover:bg-glam-surface-alt/40 transition-colors ${
                        onRowClick ? "cursor-pointer group" : ""
                      }`}
                    >
                      {columns.map((col) => {
                        const cellContent = col.cell
                          ? col.cell(row, rowIdx)
                          : col.accessorKey
                          ? row[col.accessorKey]
                          : null;

                        return (
                          <td
                            key={`cell-${col.key || col.accessorKey}-${rowKey}`}
                            className={`${cellPadding} align-middle ${getAlignmentClass(
                              col.align
                            )} ${col.className || ""}`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Standalone Reusable Pagination Component */}
          {pageSize && totalEntries > 0 && (
            <div className="shrink-0">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalEntries}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                itemLabel={itemLabel}
                compact={compact}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { Table, Table as DataTable };
export default Table;
