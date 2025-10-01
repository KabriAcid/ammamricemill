import React, { useEffect, useState } from "react";
import {
  DashboardCard,
  Card,
  DataTable,
  Button,
  FilterBar,
  Modal,
  Spinner,
  EmptyState,
} from "../../components";
import type { HeadIncome } from "../../types/entities";

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

const HeadIncomePage: React.FC = () => {
  const [data, setData] = useState<HeadIncome[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<HeadIncome | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Fetch all (GET)
  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/head-income?page=${filters.page}&pageSize=${filters.pageSize}&search=${filters.search}&sort=${filters.sort}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
        setError(null);
      })
      .catch(() => setError("Failed to fetch data."))
      .finally(() => setLoading(false));
  }, [filters]);

  // Create (POST)
  const handleCreate = async (item: HeadIncome) => {
    setLoading(true);
    try {
      await fetch("/api/head-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      setModalOpen(false);
      setFilters({ ...filters }); // refetch
    } catch {
      setError("Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  // Update (PUT)
  const handleUpdate = async (item: HeadIncome) => {
    setLoading(true);
    try {
      await fetch(`/api/head-income/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      setModalOpen(false);
      setFilters({ ...filters }); // refetch
    } catch {
      setError("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  // Delete (single or bulk)
  const handleDelete = async (ids: number[]) => {
    setLoading(true);
    try {
      await fetch("/api/head-income", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setSelectedRows([]);
      setFilters({ ...filters }); // refetch
    } catch {
      setError("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: Array<{
    key: string;
    label: string;
    render?: (row: HeadIncome) => React.ReactNode;
  }> = [
    { key: "sl", label: "#" },
    { key: "name", label: "Head Name" },
    { key: "receives", label: "Receives" },
    {
      key: "actions",
      label: "Actions",
      render: (row: HeadIncome) => (
        <div className="flex gap-2">
          <Button
            icon="Edit"
            size="sm"
            onClick={() => {
              setEditItem(row);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon="Trash"
            size="sm"
            variant="danger"
            onClick={() => handleDelete([row.id])}
          >
            Delete
          </Button>
          <Button
            icon="BookOpen"
            size="sm"
            variant="secondary"
            onClick={() => {
              /* navigate to ledger */
            }}
          >
            Ledger
          </Button>
        </div>
      ),
    },
  ];

  // KPI/stat cards (example)
  const totalReceives = data.reduce(
    (sum: number, d: HeadIncome) => sum + (d.receives || 0),
    0
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          icon="DollarSign"
          title="Total Receives"
          value={totalReceives.toLocaleString()}
        />
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
            <Button
              icon="Plus"
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
            >
              New
            </Button>
            {selectedRows.length > 0 && (
              <Button
                icon="Trash"
                variant="danger"
                onClick={() => handleDelete(selectedRows)}
              >
                Delete Selected
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            page={filters.page}
            pageSize={filters.pageSize}
            total={data.length}
            onPageChange={(page: number) => setFilters((f) => ({ ...f, page }))}
            onPageSizeChange={(pageSize: number) =>
              setFilters((f) => ({ ...f, pageSize }))
            }
            rowSelection={selectedRows}
            onRowSelection={setSelectedRows}
            bulkActions={[
              {
                label: "Delete",
                icon: "Trash",
                onClick: () => handleDelete(selectedRows),
              },
            ]}
          />
        )}
      </Card>
      <Modal
        open={modalOpen}
        item={editItem}
        onClose={() => setModalOpen(false)}
        onSave={editItem ? handleUpdate : handleCreate}
        fields={[
          { key: "name", label: "Head Name", type: "text", required: true },
        ]}
        title={editItem ? "Edit Income Head" : "New Income Head"}
      />
    </div>
  );
};

export default HeadIncomePage;
