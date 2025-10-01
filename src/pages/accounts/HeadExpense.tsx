import React, { useEffect, useState } from "react";
import { Card, DataTable, Button, FilterBar, Modal, Spinner, EmptyState, DashboardCard } from "../../components";
import type { HeadExpense } from "../../types/entities";

interface Filters {
  page: number;
  pageSize: number;
  search: string;
  sort: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
}

const initialFilters: Filters = {
  page: 1,
  pageSize: 25,
  search: "",
  sort: "asc",
  dateFrom: "",
  dateTo: "",
};

const HeadExpensePage: React.FC = () => {
  const [data, setData] = useState<HeadExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<HeadExpense | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/head-expense?page=${filters.page}&pageSize=${filters.pageSize}&search=${filters.search}&sort=${filters.sort}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`)
      .then(res => res.json())
      .then(json => { setData(json.data || []); setError(null); })
      .catch(() => setError("Failed to fetch data."))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleCreate = async (item: HeadExpense) => {
    setLoading(true);
    try {
      await fetch("/api/head-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      setModalOpen(false);
      setFilters({ ...filters });
    } catch {
      setError("Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (item: HeadExpense) => {
    setLoading(true);
    try {
      await fetch(`/api/head-expense/${item.id}", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      setModalOpen(false);
      setFilters({ ...filters });
    } catch {
      setError("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: number[]) => {
    setLoading(true);
    try {
      await fetch("/api/head-expense", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setSelectedRows([]);
      setFilters({ ...filters });
    } catch {
      setError("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  const columns: Array<{ key: string; label: string; render?: (row: HeadExpense) => React.ReactNode }> = [
    { key: "sl", label: "#" },
    { key: "name", label: "Head Name" },
    { key: "payments", label: "Payments" },
    {
      key: "actions",
      label: "Actions",
      render: (row: HeadExpense) => (
        <div className="flex gap-2">
          <Button icon="Edit" size="sm" onClick={() => { setEditItem(row); setModalOpen(true); }}>Edit</Button>
          <Button icon="Trash" size="sm" variant="danger" onClick={() => handleDelete([row.id])}>Delete</Button>
          <Button icon="BookOpen" size="sm" variant="secondary" onClick={() => { /* navigate to ledger */ }}>Ledger</Button>
        </div>
      ),
    },
  ];

  const totalPayments = data.reduce((sum: number, d: HeadExpense) => sum + (d.payments || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard icon="ArrowUpCircle" title="Total Payments" value={totalPayments.toLocaleString()} />
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            fields={[
              { key: "search", label: "Search" },
              { key: "dateFrom", label: "From", type: "date" },
              { key: "dateTo", label: "To", type: "date" },
            ]}
            pageSizeOptions={[10, 25, 50, 100]}
          />
          <div className="flex gap-2">
            <Button icon="Plus" onClick={() => { setEditItem(null); setModalOpen(true); }}>New</Button>
            {selectedRows.length > 0 && (
              <Button icon="Trash" variant="danger" onClick={() => handleDelete(selectedRows)}>Delete Selected</Button>
            )}
          </div>
        </div>
        {loading ? <Spinner /> : error ? <EmptyState message={error} /> : (
          <DataTable
            columns={columns}
            data={data}
            page={filters.page}
            pageSize={filters.pageSize}
            total={data.length}
            onPageChange={(page: number) => setFilters((f) => ({ ...f, page }))}
            onPageSizeChange={(pageSize: number) => setFilters((f) => ({ ...f, pageSize }))}
            rowSelection={selectedRows}
            onRowSelection={setSelectedRows}
            bulkActions={[{ label: "Delete", icon: "Trash", onClick: () => handleDelete(selectedRows) }]}
          />
        )}
      </Card>
      <Modal
        open={modalOpen}
        item={editItem}
        onClose={() => setModalOpen(false)}
        onSave={editItem ? handleUpdate : handleCreate}
        fields={[{ key: "name", label: "Head Name", type: "text", required: true }]}
        title={editItem ? "Edit Expense Head" : "New Expense Head"}
      />
    </div>
  );
};

export default HeadExpensePage;
