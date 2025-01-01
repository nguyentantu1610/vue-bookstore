import type Auth from "@/interfaces/auth";
import router from "@/router";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import { useToast } from "primevue";

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();
  // Init data
  const name = ref<string>("");
  const isAdmin = ref<boolean>(false);
  const initData: Auth = {
    email: "",
    verification_code: "",
    password: "",
    password_confirmation: "",
  };
  const authErrors = ref<Auth>(initData);

  function $reset() {
    authErrors.value = initData;
  }

  // Custom headers for fetch
  function customHeaders(): Headers {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    return headers;
  }

  /**
   * This function perform login/register/forgot password/send code
   *
   * @param {string} uri The uri
   * @param {Auth} formData The form input data
   */
  async function auth(uri: string, formData: Auth) {
    $reset();
    const { data, status } = await usePostOrPatchFetch<Auth>(
      "POST",
      uri,
      formData,
      customHeaders()
    );
    if (status >= 200 && status <= 299) {
      uri === "/api/send-register-code" || uri === "/api/send-forgot-code"
        ? console.log(data.code)
        : "";
      if (uri === "/api/login") {
        localStorage.setItem("token", data.token);
        !data.isAdmin
          ? router.push({ name: "home" })
          : router.push({ name: "admin" });
      }
      if (uri === "/api/register" || uri === "/api/forgot-password") {
        router.push({ name: "login" });
      }
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    status === 422 ? (authErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  // Check user
  async function checkUser() {
    const token = localStorage.getItem("token");
    if (token) {
      const headers = customHeaders();
      headers.append("Authorization", `Bearer ${token}`);
      const { data, status } = await useGetFetch("/api/check-user", headers);
      if (status >= 200 && status <= 299) {
        name.value = data.name;
        isAdmin.value = data.isAdmin;
        return;
      }
    }
    name.value = "";
    isAdmin.value = false;
  }

  // Logout system
  async function logout() {
    const token = localStorage.getItem("token");
    if (token) {
      const headers = customHeaders();
      headers.append("Authorization", `Bearer ${token}`);
      const { data, status } = await useDeleteFetch("/api/logout", headers);
      if (status < 200 || status > 299) {
        return toast.add({
          severity: "error",
          summary: "Lỗi",
          detail: data.message,
          life: 3000,
        });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("carts");
    }
    router.push({ name: "login" });
    name.value = "";
    isAdmin.value = false;
  }

  return { name, isAdmin, authErrors, $reset, auth, checkUser, logout };
});
