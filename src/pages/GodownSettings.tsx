import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';

interface Godown {
  id: number;
  name: string;
  capacity: number;
  currentStock: number;
  unit: string;
  status: 'active' | 'inactive';
  location: string;
  manager: string;
}

export const GodownSettings: React.FC = () => {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    unit: 'kg',
    location: '',
    manager: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    try {
      const response = await fetch('/api/godowns');
      const data = await response.json();
      setGodowns(data);
    } catch (error) {
      // Use mock data
      setGodowns([
        {
          id: 1,
          name: 'Main Godown',
          capacity: 50000,
          currentStock: 32000,
          unit: 'kg',
          status: 'active',
          location: 'Building A',
          manager: 'John Doe'
        },
        {
          id: 2,
          name: 'Secondary Godown',
          capacity: 30000,
          currentStock: 18500,
          unit: 'kg',
          status: 'active',
          location: 'Building B',
          manager: 'Jane Smith'
        },
        {
          id: 3,
          name: 'Reserve Godown',
          capacity: 25000,
          currentStock: 5000,
          unit: 'kg',
          status: 'active',
          location: 'Building C',
          manager: 'Bob Wilson'
        }
      ]);
    }
  };

  const handleAdd = () => {
    setEditingGodown(null);
    setFormData({
      name: '',
      capacity: 0,
      unit: 'kg',
      location: '',
      manager: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (godown: Godown) => {
    setEditingGodown(godown);
    setFormData({
      name: godown.name,
      capacity: godown.capacity,
      unit: godown.unit,
      location: godown.location,
      manager: godown.manager,
      status: godown.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingGodown ? `/api/godowns/${editingGodown.id}` : '/api/godowns';
      const method = editingGodown ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      await fetchGodowns();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save godown');
    }
  };

  const columns = [
    { key: 'name', label: 'Godown Name', sortable: true },
    { 
      key: 'capacity', 
      label: 'Capacity', 
      sortable: true,
      render: (value: number, row: Godown) => `${value.toLocaleString()} ${row.unit}`
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (value: number, row: Godown) => (
        <div className="flex flex-col">
          <span>{value.toLocaleString()} {row.unit}</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-[#AF792F] h-2 rounded-full"
              style={{
                width: `${Math.min((value / row.capacity) * 100, 100)}%`
              }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {((value / row.capacity) * 100).toFixed(1)}% full
          </span>
        </div>
      )
    },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'manager', label: 'Manager', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Settings', href: '/settings' },
        { label: 'Godown Settings' }
      ]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Godown Settings</h1>
        </div>
        <p className="text-gray-600">Manage storage godowns and their capacity</p>
      </div>

      <DataTable
        data={godowns}
        columns={columns}
        title="Storage Godowns"
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder="Search godowns..."
        addButtonLabel="Add Godown"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGodown ? 'Edit Godown' : 'Add New Godown'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godown Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="ton">Tons</option>
                <option value="bag">Bags</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                placeholder="Building or area location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                placeholder="Responsible manager name"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg transition-colors"
            >
              {editingGodown ? 'Update Godown' : 'Add Godown'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};