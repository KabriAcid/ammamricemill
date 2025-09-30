import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Printer } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { FilterBar } from '../../components/ui/FilterBar';
import { Modal } from '../../components/ui/Modal';
import { Silo } from '../../types';

const SiloList: React.FC = () => {
  const [silos, setSilos] = useState<Silo[]>([
    {
      id: '1',
      name: 'Main Storage Silo',
      capacity: 5000,
      description: 'Primary storage facility for paddy rice',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Secondary Silo A',
      capacity: 3000,
      description: 'Additional storage for processed rice',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    }
  ]);

  const [selectedSilos, setSelectedSilos] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    description: ''
  });

  const filteredSilos = silos.filter(silo =>
    silo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    silo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSilos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSilos = filteredSilos.slice(startIndex, startIndex + pageSize);

  const columns = [
    { key: 'id', label: '#', width: '80px' },
    { key: 'name', label: 'Silo Name', sortable: true },
    { 
      key: 'capacity', 
      label: 'Silo Capacity (Tons)', 
      sortable: true,
      render: (value: number) => value.toLocaleString()
    },
    { key: 'description', label: 'Description' }
  ];

  const handleEdit = (silo: Silo) => {
    setEditingSilo(silo);
    setFormData({
      name: silo.name,
      capacity: silo.capacity,
      description: silo.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (siloIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${siloIds.length} silo(s)?`)) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSilos(prev => prev.filter(silo => !siloIds.includes(silo.id)));
        setSelectedSilos([]);
      } catch (error) {
        console.error('Error deleting silos:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingSilo) {
        // Update existing silo
        setSilos(prev => prev.map(silo => 
          silo.id === editingSilo.id 
            ? { ...silo, ...formData, updatedAt: new Date().toISOString() }
            : silo
        ));
      } else {
        // Create new silo
        const newSilo: Silo = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSilos(prev => [...prev, newSilo]);
      }
      
      setShowModal(false);
      setEditingSilo(null);
      setFormData({ name: '', capacity: 0, description: '' });
    } catch (error) {
      console.error('Error saving silo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingSilo(null);
    setFormData({ name: '', capacity: 0, description: '' });
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate summary stats
  const totalCapacity = silos.reduce((sum, silo) => sum + silo.capacity, 0);
  const avgCapacity = silos.length > 0 ? totalCapacity / silos.length : 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Silo Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your storage silos and monitor capacity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{silos.length}</p>
            <p className="text-sm text-gray-500">Total Silos</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-600">{totalCapacity.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Capacity (Tons)</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{Math.round(avgCapacity).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Average Capacity (Tons)</p>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by silo name or description..."
      >
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleNew}
            icon={Plus}
            size="sm"
          >
            New Silo
          </Button>
          {selectedSilos.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedSilos)}
              loading={loading}
            >
              Delete ({selectedSilos.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      {/* Table */}
      <Table
        data={paginatedSilos}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredSilos.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          }
        }}
        selection={{
          selectedItems: selectedSilos,
          onSelectionChange: setSelectedSilos
        }}
        actions={{
          onEdit: handleEdit
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSilo ? 'Edit Silo' : 'New Silo'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Silo Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-base"
              placeholder="Enter silo name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Tons) *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
              className="input-base"
              placeholder="Enter capacity in tons"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-base"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
            >
              {editingSilo ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SiloList;