

// Auth hooks
export { useLogin, useRegister, useLogout, useRefreshToken, useChangePassword } from './auth';

// Admin hooks
export {
  useRestaurantsWithOwners,
  useAssignOwner,
  useRemoveOwner,
  usePendingAccounts,
  useUpdateAccountStatus,
  usePendingRestaurants,
  useUpdateRestaurantStatus,
} from './admin';

// Restaurant hooks
export {
  useRestaurants,
  useRestaurantById,
  useRestaurantSearch,
  useCreateRestaurant,
  useUpdateRestaurant,
  useDeleteRestaurant,
  useToggleRestaurantStatus,
  useUploadRestaurantImage,
  useDeleteRestaurantImage,
} from './restaurants';

// Menu hooks
export {
  useMenu,
  useFullMenu,
  useMenuItem,
  useMenuItemById,
  useMenuItemByName,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadMenuItemImage,
  useMenuCategories,
  useCategoryByRestaurant,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useDiscounts,
  useItemsByCategory,
  useBulkCreateItems,
} from './menu';

// Offer hooks
export {
  useOffers,
  useOfferById,
  useOffersByRestaurant,
  useActiveOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
} from './offers';

// Order hooks
export {
  useOrders,
  useMyOrders,
  useAllOrders,
  useOrdersByRestaurant,
  useOrderTrack,
  useCreateOrder,
  useCheckout,
  useCancelOrder,
  useUpdateOrderStatus,
  useUpdateAdminOrderStatus,
  useDeleteOrder,
} from './orders';

// Cart hooks
export {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useClearCart,
} from './cart';

// User hooks
export {
  useUserProfile,
  useMyProfile,
  useAllProfiles,
  useUpdateProfile,
  useFavoriteRestaurants,
  useAddFavorite,
  useRemoveFavorite,
} from './users';

// Audit log hooks
export {
  useAuditLogs,
  useAuditLogsByPhone,
  useAuditLogsByOrder,
} from './auditLogs';