import type Auth from "@/interfaces/auth";
import router from "@/router";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useDeleteFetch, usePostFetch } from "@/composables/custom-fetch";
import { useToast } from "primevue";

export const useAuthStore = defineStore("auth", () => {
  const name = ref<string>("");
  const initData: Auth = {
    email: "",
    verification_code: "",
    password: "",
    password_confirmation: "",
  };
  const authErrors = ref<Auth>(initData);
  const toast = useToast();

  function $reset() {
    authErrors.value = initData;
  }

  /**
   * This function perform login/register/forgot password/ send code
   *
   * @param {string} uri The uri
   * @param {Auth} formData The form input data
   */
  async function auth(uri: string, formData: Auth) {
    $reset();
    const { data, status } = await usePostFetch<Auth>(uri, formData);
    if (status === 422) {
      authErrors.value = data.errors;
    }
    if (status >= 200 && status <= 299) {
      if (
        uri === "/api/send-register-code" ||
        uri === "/api/send-forgot-code"
      ) {
        console.log(data.code);
      }
      if (uri === "/api/login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);
        router.push({ name: "home" });
      }
      if (uri === "/api/register" || uri === "/api/forgot-password") {
        router.push({ name: "login" });
      }
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: data.message,
        life: 3000,
      });
    }
  }

  // Get user name
  function getName() {
    const username = localStorage.getItem("username");
    if (username) {
      name.value = username;
    }
  }

  // Logout system
  async function logout() {
    const { isDeleted } = await useDeleteFetch("/api/logout");
    if (isDeleted) {
      name.value = "";
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      router.push({ name: "login" });
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Đăng xuất thành công",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: "Đăng xuất thất bại",
        life: 3000,
      });
    }
  }

  return { name, authErrors, $reset, auth, getName, logout };
});
