/**
 * Example Component demonstrating API integration
 * Replace this with your actual components
 */

'use client';

import { useState } from 'react';
import { useApi, useMutation } from '@/lib/api/hooks/useApi';
import { getItems, createItem, deleteItem, type ExampleItem, type CreateExampleItem } from '@/lib/api/services/example';
import { ApiError } from '@/lib/api/client';

export default function ExampleApiComponent() {
  const [newItem, setNewItem] = useState<CreateExampleItem>({
    title: '',
    description: '',
  });

  // Fetch items on component mount
  const { data: items, loading, error, refetch } = useApi<ExampleItem[]>(
    () => getItems(),
    true
  );

  // Mutation for creating items
  const createMutation = useMutation<ExampleItem, CreateExampleItem>();

  // Mutation for deleting items
  const deleteMutation = useMutation<void, number>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createMutation.mutate(createItem, newItem);
    
    if (result.data && !result.error) {
      // Reset form and refetch items
      setNewItem({ title: '', description: '' });
      refetch();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const result = await deleteMutation.mutate(deleteItem, id);
      
      if (!result.error) {
        refetch();
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Item</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
        
        {createMutation.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {createMutation.error.message}
          </div>
        )}
      </form>

      {/* Items List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Items List</h2>
        
        {loading && <p className="text-gray-600">Loading items...</p>}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            <p className="font-semibold">Error: {error.message}</p>
            {error.errors && (
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(error.errors).map(([field, messages]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {messages.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {!loading && !error && items && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-gray-600">No items found.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


