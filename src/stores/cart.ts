import { defineStore } from "pinia";
import { useToast } from "primevue";
import type Cart from "@/interfaces/cart";
import { ref } from "vue";
import { usePostOrPatchFetch } from "@/composables/custom-fetch";
import router from "@/router";

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
    cart.quantity = quantity ? quantity : 1;
    const cartItem = carts.value.find(
      (item) => item.product_id === cart.product_id
    );
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.quantity > 99 ? (cartItem.quantity = 99) : "";
    } else {
      carts.value.push(cart);
    }
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
    quantity ? "" : (quantity = 1);
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

  /**
   * This function to create order
   *
   */
  async function createOrder() {
    const token = localStorage.getItem("token");
    if (token) {
      const headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${token}`);
      const { data, status } = await usePostOrPatchFetch<any>(
        "POST",
        "/api/user/carts",
        { carts: carts.value },
        headers
      );
      if (status >= 200 && status <= 299) {
        router.push({ name: "profile" });
        carts.value = new Array<Cart>();
        localStorage.setItem("carts", JSON.stringify(carts.value));
        return toast.add({
          severity: "success",
          summary: "Thành công",
          detail: data.message,
          life: 3000,
        });
      }
      return toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
    return router.push({ name: "login" });
  }

  return { carts, getCart, setCart, updateCart, removeCart, createOrder };
});
