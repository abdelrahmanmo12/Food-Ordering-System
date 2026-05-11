# React Query Hooks

This directory contains all React Query hooks for the food ordering application. These hooks provide a clean abstraction layer over the API, handling caching, loading states, error handling, and data synchronization automatically.

## Architecture

The application follows a 3-layer architecture:

```
/api        → Raw API requests (fetch/post/put/delete)
/hooks      → React Query wrappers (useQuery, useMutation)
/components → UI components that consume hooks
```

## Benefits of Using React Query

- **Caching** ⚡ - Automatic data caching reduces unnecessary network requests
- **Loading States** - Built-in `isLoading`, `isFetching`, `isPending` states
- **Error Handling** - Automatic error capture and retry logic
- **Auto Refetch** - Window focus refetch, revalidation on mount
- **Sync Between Components** - Shared cache means data stays in sync
- **Optimistic Updates** - Update UI before server responds

## Usage Examples

### 1. GET Requests with useQuery

```jsx
import { useRestaurants } from '../hooks/restaurants';

function RestaurantList() {
  const { data: restaurants = [], isLoading, error } = useRestaurants();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {restaurants.map(r => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
```

### 2. POST/PUT/DELETE with useMutation

```jsx
import { useCreateRestaurant, useDeleteRestaurant } from '../hooks/restaurants';

function RestaurantManager() {
  const createMutation = useCreateRestaurant();
  const deleteMutation = useDeleteRestaurant();

  const handleCreate = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        console.log('Restaurant created!');
        // Data is automatically refetched
      },
      onError: (error) => {
        console.error('Failed:', error);
      }
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <button onClick={() => handleCreate({ name: 'New Restaurant' })}>
        Create Restaurant
      </button>
      <button onClick={() => handleDelete(123)}>
        Delete Restaurant
      </button>
    </div>
  );
}
```

### 3. Conditional Queries

```jsx
import { useRestaurantById } from '../hooks/restaurants';

function RestaurantDetail({ id }) {
  // Query only runs when id is truthy
  const { data, isLoading } = useRestaurantById(id, !!id);

  if (!id) return <div>Select a restaurant</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data.name}</div>;
}
```

## Available Hooks

### Auth Hooks (`auth.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useLogin()` | POST | `/auth/login` |
| `useRegisterCustomer()` | POST | `/auth/register/customer` |
| `useRegisterOwner()` | POST | `/auth/register/owner` |
| `useRegisterDelivery()` | POST | `/auth/register/delivery` |
| `useRegister()` | POST | Routes by role |
| `useLogout()` | POST | `/auth/logout` |
| `useRefreshToken()` | POST | `/auth/refresh` |
| `useChangePassword()` | PUT | `/auth/change-password` |

### Admin Hooks (`admin.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `usePendingAccounts()` | GET | `/auth/accounts/pending` |
| `useUpdateAccountStatus()` | PUT | `/auth/accounts/{id}/status` |
| `usePendingRestaurants(role)` | GET | `/restaurants/admin/requests` |
| `useUpdateRestaurantStatus()` | PATCH | `/restaurants/admin/requests/{id}/status` |
| `useRestaurantsWithOwners()` | GET | `/admin/restaurants-with-owners` |
| `useAssignOwner()` | POST | `/admin/restaurants/{id}/owner` |
| `useRemoveOwner()` | DELETE | `/admin/restaurants/{id}/owner` |

### Restaurant Hooks (`restaurants.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useRestaurants()` | GET | `/restaurants` |
| `useRestaurantById(id)` | GET | `/restaurants/{id}` |
| `useRestaurantSearch(name)` | GET | `/restaurants/search` |
| `useRestaurantByName(name)` | GET | `/restaurants/name/{name}` |
| `useCreateRestaurant()` | POST | `/restaurants` |
| `useUpdateRestaurant()` | PUT | `/restaurants/{id}` |
| `useDeleteRestaurant()` | DELETE | `/restaurants/{id}` |
| `useToggleRestaurantStatus()` | PATCH | `/restaurants/{id}/toggle-status` |
| `useUploadRestaurantImage()` | POST | `/restaurants/{id}/image` |
| `useDeleteRestaurantImage()` | DELETE | `/restaurants/{id}/image` |

### Menu Hooks (`menu.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useMenu(restaurantId)` | GET | `/menu/{restaurantId}` |
| `useFullMenu(restaurantId)` | GET | `/menu/{restaurantId}/menu` |
| `useMenuItem(restaurantId, itemId)` | GET | `/menu/item` |
| `useMenuItemById(id)` | GET | `/menu/item/{id}` |
| `useCreateMenuItem(restaurantId)` | POST | `/menu/{restaurantId}` |
| `useUpdateMenuItem()` | PUT | `/menu/{id}` |
| `useDeleteMenuItem()` | DELETE | `/menu/{id}` |
| `useMenuCategories(restaurantId)` | GET | `/menu/categories/restaurant/{restaurantId}` |
| `useCreateCategory(restaurantId)` | POST | `/menu/categories/{restaurantId}` |
| `useUpdateCategory()` | PUT | `/menu/categories/{id}` |
| `useDeleteCategory()` | DELETE | `/menu/categories/{id}` |

### Order Hooks (`orders.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useMyOrders(userId)` | GET | `/api/orders/me` |
| `useAllOrders({userId, userRole, userStatus})` | GET | `/api/orders/admin/all` |
| `useOrdersByRestaurant({...})` | GET | `/api/orders/restaurant/{restaurantId}` |
| `useOrderTrack(orderNumber)` | GET | `/api/orders/track/{orderNumber}` |
| `useCreateOrder()` | POST | `/api/orders` |
| `useCheckout()` | POST | `/api/orders/checkout` |
| `useCancelOrder()` | PATCH | `/api/orders/{orderNumber}/cancel` |
| `useUpdateOrderStatus()` | PATCH | `/api/orders/restaurant/{orderNumber}/status` |
| `useUpdateAdminOrderStatus()` | PATCH | `/api/orders/admin/{orderNumber}/status` |
| `useDeleteOrder()` | DELETE | `/api/orders/admin/{orderNumber}` |

### Cart Hooks (`cart.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useCart(userId)` | GET | `/api/cart` |
| `useAddToCart()` | POST | `/api/cart` |
| `useRemoveFromCart()` | DELETE | `/api/cart/items/{itemName}` |
| `useClearCart()` | DELETE | `/api/cart` |

### User Hooks (`users.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useUserProfile(id)` | GET | `/users/{id}` |
| `useMyProfile({...})` | GET | `/users/profiles/me` |
| `useAllProfiles({...})` | GET | `/users/profiles` |
| `useUpdateProfile()` | PUT | `/users/profiles/{id}` |
| `useFavoriteRestaurants({...})` | GET | `/users/profiles/favourites` |
| `useAddFavorite()` | POST | `/users/profiles/favourites/{restaurantId}` |
| `useRemoveFavorite()` | DELETE | `/users/profiles/favourites/{restaurantId}` |

### Offer Hooks (`offers.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useOffers()` | GET | `/offers/active` |
| `useOfferById(id)` | GET | `/offers/{id}` |
| `useOffersByRestaurant(restaurantId)` | GET | `/offers/restaurant/{restaurantId}` |
| `useCreateOffer(restaurantId)` | POST | `/offers/restaurant/{restaurantId}` |
| `useUpdateOffer()` | PUT | `/offers/{id}` |
| `useDeleteOffer()` | DELETE | `/offers/{id}` |

### Audit Log Hooks (`auditLogs.js`)

| Hook | Method | Endpoint |
|------|--------|----------|
| `useAuditLogs()` | GET | `/api/audit-logs` |
| `useAuditLogsByPhone(phone)` | GET | `/api/audit-logs/phone/{phone}` |
| `useAuditLogsByOrder(orderNumber)` | GET | `/api/audit-logs/order/{orderNumber}` |

## Query Keys

React Query uses query keys for caching. Our convention:

```javascript
// List queries
["restaurants", "list"]
["orders", "me", userId]
["menu", "items", restaurantId]

// Detail queries
["restaurants", "byId", id]
["orders", "track", orderNumber]

// Admin queries
["admin", "pending-accounts"]
["admin", "pending-restaurants", userRole]
```

## Invalidating Queries

Mutations automatically invalidate related queries. To manually invalidate:

```jsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Invalidate all restaurant queries
queryClient.invalidateQueries({ queryKey: ["restaurants"] });

// Invalidate specific restaurant
queryClient.invalidateQueries({ queryKey: ["restaurants", "byId", 123] });
```

## Configuration

React Query is configured in `src/app/providers/QueryProvider.jsx`:

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 30_000,           // Data is fresh for 30 seconds
    },
  },
});
```

## Migration Guide

### Before (useState/useEffect)

```jsx
const [restaurants, setRestaurants] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadRestaurants = async () => {
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  loadRestaurants();
}, []);
```

### After (React Query)

```jsx
const { data: restaurants = [], isLoading, error } = useRestaurants();
```

That's it! React Query handles loading states, error handling, caching, and refetching automatically.