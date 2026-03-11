import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Meal, UserProfile } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetAllMeals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Meal[]>({
    queryKey: ["meals", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMeals();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetDailySummary() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[bigint, bigint]>({
    queryKey: ["dailySummary", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [BigInt(0), BigInt(0)];
      return actor.getDailySummary();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateMeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      imageBytes: Uint8Array<ArrayBuffer>;
      mimeType: string;
      mealName: string;
      calories: bigint;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      let blob = ExternalBlob.fromBytes(params.imageBytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      return actor.createMeal(
        blob,
        params.mimeType,
        params.mealName,
        params.calories,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useDeleteMeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteMeal(mealId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
