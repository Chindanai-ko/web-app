import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

interface ProductStore {
    products: any[];
    loading: boolean;
    error?: string;
    setProducts: (products: any[]) => void;
    createProduct: (productData: any) => Promise<void>;
    fetchAllProducts: () => Promise<void>;
    fetchProductsByCategory: (category: string) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    toggleFeaturedProduct: (productId: string) => Promise<void>;
    fetchFeaturedProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to create product";
            toast.error(errorMessage);
            set({ loading: false, error: errorMessage });
        }
    },    
	fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const response = await axios.get("/products");
            set({ products: response.data.data, loading: false });
        } catch (error: any) {
            console.error("Error fetching products:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || "Failed to fetch products";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
        }
    },        
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error: any) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {
        set({ loading: true });
        try {
            await axios.delete(`/products/${productId}`);
            set((prevState) => ({
                products: prevState.products.filter((product) => product._id !== productId),
                loading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to delete product";
            toast.error(errorMessage);
            set({ loading: false, error: errorMessage });
        }
    },    
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error: any) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data, loading: false });
		} catch (error: any) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));