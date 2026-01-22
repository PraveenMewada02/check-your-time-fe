# Django REST Framework (DRF) API Integration Guide

This guide explains how to integrate your Next.js frontend with your Django REST Framework backend.

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Replace `http://localhost:8000/api` with your actual DRF backend URL.

### 2. Project Structure

```
lib/
  api/
    config.ts          # API configuration
    client.ts          # Axios client with interceptors
    services/
      auth.ts          # Authentication API calls
      example.ts       # Example CRUD operations
    hooks/
      useApi.ts        # React hooks for API calls
components/
  ExampleApiComponent.tsx  # Example component using API
  AuthExample.tsx          # Example authentication component
```

## Usage

### Basic API Call

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const response = await apiClient.get('/items/');
console.log(response.data);

// POST request
const newItem = await apiClient.post('/items/', {
  title: 'New Item',
  description: 'Description here'
});
```

### Using React Hooks

```typescript
import { useApi } from '@/lib/api/hooks/useApi';
import { getItems } from '@/lib/api/services/example';

function MyComponent() {
  const { data, loading, error, refetch } = useApi(() => getItems());
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(item => <div key={item.id}>{item.title}</div>)}
    </div>
  );
}
```

### Mutations (POST, PUT, PATCH, DELETE)

```typescript
import { useMutation } from '@/lib/api/hooks/useApi';
import { createItem } from '@/lib/api/services/example';

function CreateForm() {
  const createMutation = useMutation();
  
  const handleSubmit = async (data) => {
    const result = await createMutation.mutate(createItem, data);
    if (result.data) {
      // Success!
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createMutation.loading}>
        {createMutation.loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

## Authentication

The API client automatically handles authentication tokens. It looks for a token in `localStorage` with the key `auth_token`.

### Setting Up Authentication

1. **Token Authentication (DRF Token Auth)**:
   - Update `lib/api/client.ts` line 48 to use:
     ```typescript
     config.headers.Authorization = `Token ${token}`;
     ```

2. **JWT Authentication**:
   - The current setup uses Bearer tokens (JWT)
   - Update if your DRF uses a different format

3. **Login Example**:
   ```typescript
   import { login } from '@/lib/api/services/auth';
   
   const handleLogin = async (username, password) => {
     try {
       const response = await login({ username, password });
       // Token is automatically stored
       console.log('Logged in:', response.user);
     } catch (error) {
       console.error('Login failed:', error.message);
     }
   };
   ```

## Creating New API Services

1. Create a new file in `lib/api/services/`:

```typescript
import { apiClient, ApiResponse, ApiError } from '../client';

export interface MyData {
  id: number;
  name: string;
}

export const getMyData = async (): Promise<MyData[]> => {
  try {
    const response = await apiClient.get<MyData[]>('my-endpoint/');
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
};
```

2. Use it in your components:

```typescript
import { useApi } from '@/lib/api/hooks/useApi';
import { getMyData } from '@/lib/api/services/my-service';

function MyComponent() {
  const { data, loading, error } = useApi(() => getMyData());
  // ...
}
```

## Error Handling

The API client automatically handles common errors:

- **401 Unauthorized**: Clears token and shows error
- **403 Forbidden**: Shows permission error
- **404 Not Found**: Shows not found error
- **500 Server Error**: Shows server error message
- **Network Errors**: Shows connection error

DRF field-specific errors are also extracted and available in `error.errors`:

```typescript
if (error.errors) {
  Object.entries(error.errors).forEach(([field, messages]) => {
    console.log(`${field}: ${messages.join(', ')}`);
  });
}
```

## CORS Configuration (Django Backend)

Make sure your Django backend allows requests from your Next.js frontend. Add to your Django `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# For development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js default port
]

# Or allow all origins (development only!)
# CORS_ALLOW_ALL_ORIGINS = True

# Allow credentials (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True
```

## Next Steps

1. Update `lib/api/services/` with your actual API endpoints
2. Replace example components with your actual components
3. Configure authentication method (Token/JWT) in `lib/api/client.ts`
4. Update API base URL in `.env.local`
5. Test the integration with your DRF backend

## Example Components

- `components/ExampleApiComponent.tsx` - Shows CRUD operations
- `components/AuthExample.tsx` - Shows authentication flow

You can import and use these components in your pages to see the integration in action.


