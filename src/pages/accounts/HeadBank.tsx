import React, { useEffect, useState } from "react";
import { Card, DataTable, Button, FilterBar, Modal, Spinner, EmptyState, DashboardCard } from "../../components";
import type { HeadBank } from "../../types/entities";

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

const HeadBankPage: React.FC = () => {
  const [data, setData] = useState<HeadBank[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<HeadBank | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/head-bank?page=${filters.page}&pageSize=${filters.pageSize}&search=${filters.search}&sort=${filters.sort}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`)
      .then(res => res.json())
      .then(json => { setData(json.data || []); setError(null); })
      .catch(() => setError("Failed to fetch data."))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleCreate = async (item: HeadBank) => {
    setLoading(true);
    try {
      await fetch("/api/head-bank", {
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

  const handleUpdate = async (item: HeadBank) => {
    setLoading(true);
    try {
      await fetch(`/api/head-bank/${item.id}", {
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
      await fetch("/api/head-bank", {
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

  const columns: Array<{ key: string; label: string; render?: (row: HeadBank) => React.ReactNode }> = [
    { key: "sl", label: "#" },
    { key: "name", label: "Head Name" },
    { key: "receive", label: "Receive" },
    { key: "payment", label: "Payment" },
    { key: "balance", label: "Balance" },
    {
      key: "actions",
      label: "Actions",
      render: (row: HeadBank) => (
        <div className="flex gap-2">
          <Button icon="Edit" size="sm" onClick={() => { setEditItem(row); setModalOpen(true); }}>Edit</Button>
          <Button icon="Trash" size="sm" variant="danger" onClick={() => handleDelete([row.id])}>Delete</Button>
          <Button icon="BookOpen" size="sm" variant="secondary" onClick={() => { /* navigate to ledger */ }}>Ledger</Button>
        </div>
      ),
    },
  ];

  const totalReceive = data.reduce((sum: number, d: HeadBank) => sum + (d.receive || 0), 0);
  const totalPayment = data.reduce((sum: number, d: HeadBank) => sum + (d.payment || 0), 0);
  const totalBalance = data.reduce((sum: number, d: HeadBank) => sum + (d.balance || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard icon="Banknote" title="Total Receive" value={totalReceive.toLocaleString()} />
        <DashboardCard icon="ArrowUpCircle" title="Total Payment" value={totalPayment.toLocaleString()} />
        <DashboardCard icon="Wallet" title="Total Balance" value={totalBalance.toLocaleString()} />
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
        title={editItem ? "Edit Bank Head" : "New Bank Head"}
      />
    </div>
  );
};

export default HeadBankPage;
