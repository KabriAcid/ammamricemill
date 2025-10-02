import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input } from "../../components/ui/Input";
import { Plus, Printer, Pencil, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  text: string;
}

export function SMSTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editItem, setEditItem] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { key: "name", label: "Name" },
    { key: "text", label: "Text" },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, template: Template) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            onClick={() => handleEdit(template)}
            aria-label="Edit template"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(template.id)}
            aria-label="Delete template"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleNew = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditItem(template);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete
  };

  const handleSave = async (data: Partial<Template>) => {
    // TODO: Implement save
    setModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FilterBar onSearch={setSearchTerm} placeholder="Search templates..." />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
            aria-label="Print templates list"
          >
            Print
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleNew}
            aria-label="Create new template"
          >
            New Template
          </Button>
        </div>
      </div>

      <Table
        data={templates}
        columns={columns}
        loading={loading}
        selection={{
          selectedItems: selectedRows,
          onSelectionChange: setSelectedRows,
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Template" : "New Template"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            handleSave({
              name: formData.get("name") as string,
              text: formData.get("text") as string,
            });
          }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              className="input-base w-full"
              defaultValue={editItem?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Template Text
            </label>
            <textarea
              name="text"
              className="input-base w-full"
              defaultValue={editItem?.text}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              type="button"
              aria-label="Cancel template changes"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              aria-label="Save template changes"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
