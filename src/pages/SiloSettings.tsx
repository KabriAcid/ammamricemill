import React, { useState, useEffect } from 'react';
import { Warehouse } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';

interface Silo {
  id: number;
  name: string;
  capacity: number;
  currentStock: number;
  unit: string;
  status: 'active' | 'inactive';
  location: string;
}

export const SiloSettings: React.FC = () => {
  const [silos, setSilos] = useState<Silo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    unit: 'kg',
    location: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchSilos();
  }, []);

  const fetchSilos = async () => {
    try {
      const response = await fetch('/api/silos');
      const data = await response.json();
      setSilos(data);
    } catch (error) {
      // Use mock data
      setSilos([
        {
          id: 1,
          name: 'Silo A',
          capacity: 10000,
          currentStock: 7500,
          unit: 'kg',
          status: 'active',
          location: 'Main Storage'
        },
        {
          id: 2,
          name: 'Silo B',
          capacity: 8000,
          currentStock: 3200,
          unit: 'kg',
          status: 'active',
          location: 'Secondary Storage'
        },
        {
          id: 3,
          name: 'Silo C',
          capacity: 12000,
          currentStock: 0,
          unit: 'kg',
          status: 'inactive',
          location: 'Reserve Storage'
        }
      ]);
    }
  };

  const handleAdd = () => {
    setEditingSilo(null);
    setFormData({
      name: '',
      capacity: 0,
      unit: 'kg',
      location: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (silo: Silo) => {
    setEditingSilo(silo);
    setFormData({
      name: silo.name,
      capacity: silo.capacity,
      unit: silo.unit,
      location: silo.location,
      status: silo.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSilo ? `/api/silos/${editingSilo.id}` : '/api/silos';
      const method = editingSilo ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      await fetchSilos();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save silo');
    }
  };

  const columns = [
    { key: 'name', label: 'Silo Name', sortable: true },
    { 
      key: 'capacity', 
      label: 'Capacity', 
      sortable: true,
      render: (value: number, row: Silo) => `${value.toLocaleString()} ${row.unit}`
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (value: number, row: Silo) => (
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
        </div>
      )
    },
    { key: 'location', label: 'Location', sortable: true },
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
        { label: 'Silo Settings' }
      ]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Warehouse className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Silo Settings</h1>
        </div>
        <p className="text-gray-600">Manage storage silos and their capacity</p>
      </div>

      <DataTable
        data={silos}
        columns={columns}
        title="Storage Silos"
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder="Search silos..."
        addButtonLabel="Add Silo"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSilo ? 'Edit Silo' : 'Add New Silo'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Silo Name
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                placeholder="Storage location or building"
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
              {editingSilo ? 'Update Silo' : 'Add Silo'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};