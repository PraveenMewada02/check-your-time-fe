# Quick Start Guide - DRF + Next.js Integration

## 🚀 Setup Steps

### 1. Configure Your Backend URL

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Important:** Replace `http://localhost:8000/api` with your actual Django backend URL.

### 2. Update Authentication Method (if needed)

If your DRF backend uses **Token Authentication** instead of JWT, update `lib/api/client.ts`:

Find this line (around line 48):
```typescript
config.headers.Authorization = `Bearer ${token}`;
```

Change it to:
```typescript
config.headers.Authorization = `Token ${token}`;
```

### 3. Update API Endpoints

Replace the example endpoints in `lib/api/services/` with your actual DRF endpoints:

- `lib/api/services/auth.ts` - Update login/register endpoints
- `lib/api/services/example.ts` - Replace with your actual models/endpoints

### 4. Use in Your Components

```typescript
'use client';

import { useApi } from '@/lib/api/hooks/useApi';
import { getItems } from '@/lib/api/services/example';

export default function MyPage() {
  const { data, loading, error } = useApi(() => getItems());
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(item => <div key={item.id}>{item.title}</div>)}
    </div>
  );
}
```

## 📁 File Structure

```
lib/
  api/
    config.ts          # API base URL configuration
    client.ts          # Axios client with auth & error handling
    services/          # API service functions
      auth.ts          # Authentication endpoints
      example.ts       # Example CRUD operations
    hooks/
      useApi.ts        # React hooks for API calls

components/
  ExampleApiComponent.tsx  # Full example with CRUD
  AuthExample.tsx         # Authentication example
```

## 🔑 Key Features

✅ Automatic token management (localStorage)  
✅ Request/response interceptors  
✅ Error handling for DRF format  
✅ React hooks for easy API calls  
✅ TypeScript support  
✅ Loading and error states  

## 🧪 Test the Integration

1. Start your Django backend:
   ```bash
   python manage.py runserver
   ```

2. Start your Next.js frontend:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` and test the API calls

## 📚 Next Steps

- Read `README_API_INTEGRATION.md` for detailed documentation
- Update API services with your actual endpoints
- Customize error handling as needed
- Add more hooks/utilities as your app grows

## ⚠️ CORS Setup (Django)

Don't forget to configure CORS in your Django `settings.py`:

```python
INSTALLED_APPS = [
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```


