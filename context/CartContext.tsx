import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  cart: { [key: string]: CartItem };
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});

  // Persistence (optional but good)
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem("canteengo_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.error("Cart loading error:", e);
    }
  };

  const saveCart = async (newCart: { [key: string]: CartItem }) => {
    try {
      await AsyncStorage.setItem("canteengo_cart", JSON.stringify(newCart));
    } catch (e) {
      console.error("Cart saving error:", e);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id]) {
        newCart[item.id].quantity += 1;
      } else {
        newCart[item.id] = {
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image_url: item.image_url,
        };
      }
      saveCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (!newCart[id]) return prev;
      
      if (newCart[id].quantity > 1) {
        newCart[id].quantity -= 1;
      } else {
        delete newCart[id];
      }
      saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    AsyncStorage.removeItem("canteengo_cart");
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
