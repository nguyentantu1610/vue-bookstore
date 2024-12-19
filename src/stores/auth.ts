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
  const name = ref<string>("");
  const isAdmin = ref<boolean>(false);
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

  // Custom headers for fetch
  function customHeaders(): Headers {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    return headers;
  }

  /**
   * This function perform login/register/forgot password/ send code
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
      if (
        uri === "/api/send-register-code" ||
        uri === "/api/send-forgot-code"
      ) {
        console.log(data.code);
      }
      if (uri === "/api/login") {
        localStorage.setItem("token", data.token);
        if (!data.isAdmin) {
          router.push({ name: "home" });
        } else {
          router.push({ name: "admin" });
        }
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
      return;
    }
    if (status === 422) {
      authErrors.value = data.errors;
    }
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
    name.value = "";
    isAdmin.value = false;
    if (token) {
      const headers = customHeaders();
      headers.append("Authorization", `Bearer ${token}`);
      const { data, status } = await useGetFetch("/api/check-user", headers);
      if (status >= 200 && status <= 299) {
        name.value = data.name;
        isAdmin.value = data.isAdmin;
      }
      if (status === 401) {
        localStorage.removeItem("token");
      }
    }
  }

  // Logout system
  async function logout() {
    const { status } = await useDeleteFetch("/api/logout");
    if (status >= 200 && status <= 299) {
      name.value = "";
      isAdmin.value = false;
      localStorage.removeItem("token");
      router.push({ name: "login" });
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Đăng xuất thành công~",
        life: 3000,
      });
      return;
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Đăng xuất thất bại",
      life: 3000,
    });
  }

  return { name, isAdmin, authErrors, $reset, auth, checkUser, logout };
});
