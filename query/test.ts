import { useQuery } from '@tanstack/react-query';

const fetchProductById = async (id: number) => {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    return response.json();
}

export const useFetchProductById = (id: number) => {
    return useQuery({
        queryKey: ['id', id],
        queryFn: () => fetchProductById(id)
    })
}