import {
    UseMutateFunction,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

export function useStorage<T>(
    key: string,
    initialValue: T
): [T | undefined, UseMutateFunction<void, unknown, T, unknown>] {
    const queryClient = useQueryClient();

    const { data: valueFromStorage, isFetched } = useQuery<T>({
        queryKey: [key],
        queryFn: async () => {
            return (await chrome.storage.local.get([key]))[key] as T;
        },
    });

    const mutation = useMutation({
        mutationFn: async (newValue: T) => {
            await chrome.storage.local.set({
                [key]: newValue,
            });

            queryClient.invalidateQueries({ queryKey: [key] });
        },
    });

    function initializeStorageValue() {
        if (
            initialValue !== undefined &&
            isFetched &&
            valueFromStorage === undefined
        ) {
            mutation.mutate(initialValue);
        }
    }

    useEffect(initializeStorageValue, [
        initialValue,
        isFetched,
        mutation,
        valueFromStorage,
    ]);

    return [valueFromStorage, mutation.mutate];
}
