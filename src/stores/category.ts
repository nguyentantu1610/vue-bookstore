import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Category from "@/interfaces/category";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useCategoryStore = defineStore("category", () => {
  const results = ref();
  const initData: Category = { name: "", description: "" };
  const categoryErrors = ref<Category>(initData);
  const toast = useToast();

  function $reset() {
    categoryErrors.value = initData;
  }

  // Custom headers for fetch
  function customHeaders(): Headers {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);
    return headers;
  }

  /**
   * This function to fetch categories
   *
   * @param uri The fetch uri
   */
  async function getCategories(uri: string) {
    const headers = customHeaders();
    headers.append("Accept", "application/json");
    const { data, status } = await useGetFetch(uri, headers);
    results.value = null;
    if (status >= 200 && status <= 299) {
      results.value = data.data;
    }
    if (status === 401) {
      localStorage.removeItem("token");
    }
  }

  /**
   * This function to get file
   *
   */
  async function getFile() {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);
    const { status } = await useGetFetch(
      "/api/admin/categories/export",
      headers
    );
    if (status >= 200 && status <= 299) {
      console.log("Success~");
    }
    if (status === 401) {
      localStorage.removeItem("token");
    }
  }

  /**
   * This function to create or update category
   *
   * @param {string} method (false is create and vice versa)
   * @param {string} uri The fetch uri
   * @param {Category} formData The fetch body
   */
  async function createOrUpdateCategory(
    method: string,
    uri: string,
    formData: Category
  ) {
    $reset();
    const headers = customHeaders();
    headers.append("Accept", "application/json");
    const { data, status } = await usePostOrPatchFetch<Category>(
      method,
      uri,
      formData,
      headers
    );
    if (status >= 200 && status <= 299) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
      return;
    }
    if (status === 422) {
      categoryErrors.value = data.errors;
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function to delete category
   *
   * @param uri The fetch uri
   */
  async function deleteCategory(uri: string) {
    const { status } = await useDeleteFetch(uri);
    if (status >= 200 && status <= 299) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Xoá danh mục thành công~",
        life: 3000,
      });
      return;
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Xoá danh mục thất bại",
      life: 3000,
    });
  }

  /**
   * This function to restore category
   *
   * @param {string} uri The fetch uri
   */
  async function restoreCategory(uri: string) {
    $reset();
    const { data, status } = await usePostOrPatchFetch<Category>(
      "PATCH",
      uri,
      initData,
      customHeaders()
    );
    if (status >= 200 && status <= 299) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Khôi phục thành công~",
        life: 3000,
      });
      return;
    }
    if (status === 422) {
      categoryErrors.value = data.errors;
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Khôi phục thất bại",
      life: 3000,
    });
  }

  return {
    results,
    categoryErrors,
    getCategories,
    createOrUpdateCategory,
    deleteCategory,
    $reset,
    getFile,
    restoreCategory,
  };
});
