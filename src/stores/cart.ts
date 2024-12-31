import { defineStore } from "pinia";
import { useToast } from "primevue";
import type Cart from "@/interfaces/cart";
import { ref } from "vue";

export const useCartStore = defineStore("cart", () => {
  const toast = useToast();
  // Init data
  const carts = ref<Array<Cart>>(new Array<Cart>());

  // Retrieve cart form local storage
  function getCart() {
    if (!carts.value.length) {
      const data = localStorage.getItem("carts");
      data ? (carts.value = JSON.parse(data)) : console.log("No item in carts");
    }
  }

  // Add cart to carts
  function setCart(cart: Cart, quantity: number = 1) {
    cart.quantity = quantity;
    const cartItem = carts.value.find(
      (item) => item.product_id === cart.product_id
    );
    cartItem ? (cartItem.quantity += quantity) : carts.value.push(cart);
    localStorage.setItem("carts", JSON.stringify(carts.value));
    toast.add({
      severity: "success",
      summary: "Thành công",
      detail: `Đã thêm ${cart.name} vào giỏ hàng~`,
      life: 3000,
    });
  }

  // Update cart
  function updateCart(id: string, quantity: number) {
    const cartItem = carts.value.find((item) => item.product_id === id);
    cartItem ? (cartItem.quantity = quantity) : console.log(`${id} not found!`);
    localStorage.setItem("carts", JSON.stringify(carts.value));
  }

  // Remove cart
  function removeCart(id: string) {
    const cartItem = carts.value.findIndex((item) => item.product_id === id);
    cartItem !== -1
      ? carts.value.splice(cartItem, 1)
      : console.log(`${id} not found!`);
    localStorage.setItem("carts", JSON.stringify(carts.value));
  }

  return { carts, getCart, setCart, updateCart, removeCart };
});
