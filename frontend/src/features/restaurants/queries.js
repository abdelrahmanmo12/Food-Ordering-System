import { useQuery } from "@tanstack/react-query";
import { fetchRestaurants, fetchRestaurantById } from "../../api/restaurants";

export const restaurantKeys = {
  all: ["restaurants"],
  lists: () => [...restaurantKeys.all, "list"],
  list: (params) => [...restaurantKeys.lists(), params || {}],
  details: () => [...restaurantKeys.all, "detail"],
  detail: (id) => [...restaurantKeys.details(), String(id)],
};

export function useRestaurantsQuery() {
  return useQuery({
    queryKey: restaurantKeys.list(),
    queryFn: fetchRestaurants,
  });
}

export function useRestaurantByIdQuery(id) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => fetchRestaurantById(id),
    enabled: !!id,
  });
}

