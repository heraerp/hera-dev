import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, Download, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Universal CRUD Template Component
const UniversalCRUD = ({
  entityType = "items",
  entityTypeLabel = "Items",
  entitySingular = "item",
  entitySingularLabel = "Item",
  organizationId = "demo-org",
  fields = [],
  onSave = () => {},
  onDelete = () => {},
  customActions = [],
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  enableBulkActions = true
}) => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('list'); // list, create, edit, view
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mock data for demo
  useEffect(() => {
    // In real implementation, this would be: loadData()
    setItems([
      {
        id: '1',
        name: 'Sample Item 1',
        status: 'active',
        email: 'item1@example.com',
        phone: '+1 (555) 123-4567',
        category: 'Category A',
        priority: 'high',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Sample Item 2',
        status: 'inactive',
        email: 'item2@example.com',
        phone: '+1 (555) 987-6543',
        category: 'Category B',
        priority: 'medium',
        created_at: '2024-01-14T15:45:00Z',
        updated_at: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        name: 'Sample Item 3',
        status: 'pending',
        email: 'item3@example.com',
        phone: '+1 (555) 456-7890',
        category: 'Category A',
        priority: 'low',
        created_at: '2024-01-13T09:15:00Z',
        updated_at: '2024-01-13T09:15:00Z'
      }
    ]);
  }, []);

  // Default field configuration if none provided
  const defaultFields = fields.length > 0 ? fields : [
    { 
      key: 'name', 
      label: 'Name', 
      type: 'text', 
      required: true, 
      searchable: true,
      sortable: true,
      showInList: true 
    },
    { 
      key: 'email', 
      label: 'Email', 
      type: 'email', 
      required: false, 
      searchable: true,
      sortable: true,
      showInList: true 
    },
    { 
      key: 'phone', 
      label: 'Phone', 
      type: 'tel', 
      required: false, 
      searchable: false,
      sortable: false,
      showInList: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'inactive', label: 'Inactive', color: 'red' },
        { value: 'pending', label: 'Pending', color: 'yellow' }
      ],
      required: true, 
      searchable: false,
      sortable: true,
      showInList: true 
    },
    { 
      key: 'category', 
      label: 'Category', 
      type: 'select',
      options: [
        { value: 'Category A', label: 'Category A' },
        { value: 'Category B', label: 'Category B' },
        { value: 'Category C', label: 'Category C' }
      ],
      required: false, 
      searchable: true,
      sortable: true,
      showInList: true 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select',
      options: [
        { value: 'high', label: 'High', color: 'red' },
        { value: 'medium', label: 'Medium', color: 'yellow' },
        { value: 'low', label: 'Low', color: 'green' }
      ],
      required: false, 
      searchable: false,
      sortable: true,
      showInList: true 
    }
  ];

  // Get searchable fields
  const searchableFields = defaultFields.filter(field => field.searchable);
  
  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchableFields.some(field => {
        const value = item[field.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Additional filters
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterValue && item[filterKey] !== filterValue) {
        return false;
      }
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === sortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedItems.map(item => item.id)));
    }
  };

  // Status badge component
  const StatusBadge = ({ status, type = 'status' }) => {
    const field = defaultFields.find(f => f.key === type);
    const option = field?.options?.find(opt => opt.value === status);
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const colorClass = colorClasses[option?.color] || colorClasses.gray;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {option?.label || status}
      </span>
    );
  };

  // Form component
  const FormView = ({ item = null, onClose }) => {
    const [formData, setFormData] = useState(() => {
      const initialData = {};
      defaultFields.forEach(field => {
        initialData[field.key] = item?.[field.key] || '';
      });
      return initialData;
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
      // Validate required fields
      const newErrors = {};
      defaultFields.forEach(field => {
        if (field.required && !formData[field.key]) {
          newErrors[field.key] = `${field.label} is required`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Save item
      onSave({ ...formData, id: item?.id || Date.now().toString() });
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {item ? `Edit ${entitySingularLabel}` : `Create ${entitySingularLabel}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultFields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                  
                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {item ? 'Update' : 'Create'} {entitySingularLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Details view component
  const DetailsView = ({ item, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {entitySingularLabel} Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultFields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {field.label}
                  </label>
                  <div className="text-sm text-gray-900">
                    {field.type === 'select' && (field.key === 'status' || field.key === 'priority') ? (
                      <StatusBadge status={item[field.key]} type={field.key} />
                    ) : (
                      item[field.key] || '-'
                    )}
                  </div>
                </div>
              ))}
              
              {/* System fields */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Updated At
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(item.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('edit');
                  setSelectedItem(item);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Edit {entitySingularLabel}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{entityTypeLabel}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your {entityTypeLabel.toLowerCase()} with ease
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentView('create');
                setSelectedItem(null);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {entitySingularLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              {enableSearch && (
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={`Search ${entityTypeLabel.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {enableFilters && (
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                )}
                
                {enableExport && (
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                )}

                <button
                  onClick={() => setIsLoading(!isLoading)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Bulk actions */}
            {enableBulkActions && selectedItems.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Delete Selected
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Export Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {enableBulkActions && (
                    <th scope="col" className="relative px-6 py-3">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedItems.size === sortedItems.length && sortedItems.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  
                  {defaultFields
                    .filter(field => field.showInList)
                    .map(field => (
                      <th
                        key={field.key}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          field.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                        }`}
                        onClick={() => field.sortable && handleSort(field.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{field.label}</span>
                          {field.sortable && sortConfig.key === field.key && (
                            <span className="text-blue-500">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {enableBulkActions && (
                      <td className="relative px-6 py-4">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                    )}
                    
                    {defaultFields
                      .filter(field => field.showInList)
                      .map(field => (
                        <td key={field.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {field.type === 'select' && (field.key === 'status' || field.key === 'priority') ? (
                              <StatusBadge status={item[field.key]} type={field.key} />
                            ) : (
                              item[field.key] || '-'
                            )}
                          </div>
                        </td>
                      ))}
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentView('view');
                            setSelectedItem(item);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('edit');
                            setSelectedItem(item);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete this ${entitySingularLabel.toLowerCase()}?`)) {
                              onDelete(item.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {entityTypeLabel.toLowerCase()} found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `No ${entityTypeLabel.toLowerCase()} match your search criteria.`
                  : `Get started by creating your first ${entitySingularLabel.toLowerCase()}.`
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setCurrentView('create');
                    setSelectedItem(null);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create {entitySingularLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination would go here */}
        {sortedItems.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {sortedItems.length} of {items.length} {entityTypeLabel.toLowerCase()}
            </div>
            
            {/* Pagination controls would be implemented here */}
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</span>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {currentView === 'create' && (
        <FormView 
          onClose={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'edit' && selectedItem && (
        <FormView 
          item={selectedItem}
          onClose={() => {
            setCurrentView('list');
            setSelectedItem(null);
          }}
        />
      )}
      
      {currentView === 'view' && selectedItem && (
        <DetailsView 
          item={selectedItem}
          onClose={() => {
            setCurrentView('list');
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

// Usage example with different configurations
const CRUDExamples = () => {
  const [activeExample, setActiveExample] = useState('customers');

  const examples = {
    customers: {
      entityType: "customers",
      entityTypeLabel: "Customers",
      entitySingular: "customer", 
      entitySingularLabel: "Customer",
      fields: [
        { key: 'name', label: 'Full Name', type: 'text', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'email', label: 'Email Address', type: 'email', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'phone', label: 'Phone Number', type: 'tel', required: false, searchable: false, sortable: false, showInList: true },
        { key: 'company', label: 'Company', type: 'text', required: false, searchable: true, sortable: true, showInList: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'inactive', label: 'Inactive', color: 'red' },
          { value: 'pending', label: 'Pending', color: 'yellow' }
        ], required: true, searchable: false, sortable: true, showInList: true }
      ]
    },
    products: {
      entityType: "products",
      entityTypeLabel: "Products", 
      entitySingular: "product",
      entitySingularLabel: "Product",
      fields: [
        { key: 'name', label: 'Product Name', type: 'text', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'sku', label: 'SKU', type: 'text', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'price', label: 'Price', type: 'number', required: true, searchable: false, sortable: true, showInList: true },
        { key: 'category', label: 'Category', type: 'select', options: [
          { value: 'electronics', label: 'Electronics' },
          { value: 'clothing', label: 'Clothing' },
          { value: 'home', label: 'Home & Garden' }
        ], required: true, searchable: true, sortable: true, showInList: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'discontinued', label: 'Discontinued', color: 'red' },
          { value: 'draft', label: 'Draft', color: 'yellow' }
        ], required: true, searchable: false, sortable: true, showInList: true }
      ]
    },
    invoices: {
      entityType: "invoices",
      entityTypeLabel: "Invoices",
      entitySingular: "invoice", 
      entitySingularLabel: "Invoice",
      fields: [
        { key: 'number', label: 'Invoice Number', type: 'text', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'customer', label: 'Customer', type: 'text', required: true, searchable: true, sortable: true, showInList: true },
        { key: 'amount', label: 'Amount', type: 'number', required: true, searchable: false, sortable: true, showInList: true },
        { key: 'due_date', label: 'Due Date', type: 'date', required: true, searchable: false, sortable: true, showInList: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'draft', label: 'Draft', color: 'gray' },
          { value: 'sent', label: 'Sent', color: 'blue' },
          { value: 'paid', label: 'Paid', color: 'green' },
          { value: 'overdue', label: 'Overdue', color: 'red' }
        ], required: true, searchable: false, sortable: true, showInList: true }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Example Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">HERA Universal CRUD Template Examples</h2>
        <div className="flex space-x-4">
          {Object.entries(examples).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeExample === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.entityTypeLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Active Example */}
      <UniversalCRUD
        {...examples[activeExample]}
        onSave={(data) => console.log('Save:', data)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  );
};

export default CRUDExamples;