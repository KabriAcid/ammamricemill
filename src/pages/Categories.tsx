import React, { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { mockCategories } from '../mock';

interface Category {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setCategories(mockCategories);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE'
        });
        await fetchCategories();
      } catch (error) {
        console.error('Failed to delete category');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category');
    }
    setLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
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
        { label: 'Products' },
        { label: 'Categories' }
      ]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
        </div>
        <p className="text-gray-600">Manage product categories for better organization</p>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        title="All Categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search categories..."
        addButtonLabel="Add Category"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              placeholder="Brief description of the category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              disabled={loading}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};