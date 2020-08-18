import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('products');

      if (response) {
        const savedProducts = JSON.parse(response);

        setProducts(savedProducts);
      }
    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      setProducts([...products, product]);

      AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex((product: Product) => {
        return product.id === id;
      });

      const newProduct = {
        ...products[productIndex],
        quantity: products[productIndex].quantity + 1,
      };

      setProducts([...products, newProduct]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex((product: Product) => {
        return product.id === id;
      });

      const newProduct = {
        ...products[productIndex],
        quantity: products[productIndex].quantity - 1,
      };

      setProducts([...products, newProduct]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
