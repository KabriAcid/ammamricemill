import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Database, Upload, Download, Trash2 } from "lucide-react";

interface Backup {
  id: string;
  createdAt: string;
  createdBy: string;
  fileName: string;
}

export default function DatabaseBackup() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const columns = [
    {
      key: "createdAt",
      label: "Created At",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    { key: "createdBy", label: "Created By" },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, backup: Backup) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={() => handleDownload(backup)}
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(backup.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleGenerateBackup = async () => {
    setGenerating(true);
    try {
      // TODO: Implement backup generation
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleRestore = async (file: File) => {
    setRestoring(true);
    try {
      // TODO: Implement backup restoration
    } catch (error) {
      console.error(error);
    } finally {
      setRestoring(false);
    }
  };

  const handleDownload = async (backup: Backup) => {
    // TODO: Implement backup download
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement backup deletion
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Database Backup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generate Backup Section */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary-800" />
              <h2 className="text-lg font-semibold">Generate Backup</h2>
            </div>
            <p className="text-gray-600">
              Create a new backup of your database. This process may take a few
              minutes.
            </p>
            <Button
              variant="primary"
              icon={Download}
              loading={generating}
              onClick={handleGenerateBackup}
            >
              Generate New Backup
            </Button>
          </div>
        </Card>

        {/* Restore Backup Section */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-primary-800" />
              <h2 className="text-lg font-semibold">Restore Backup</h2>
            </div>
            <p className="text-gray-600">
              Restore your database from a backup file. This will overwrite
              current data.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                accept=".sql,.dump"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleRestore(file);
                  }
                }}
              />
              <Button
                variant="primary"
                icon={Upload}
                loading={restoring}
                disabled={!restoring}
              >
                Restore
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Backups Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Backups</h2>
        <Table data={backups} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
