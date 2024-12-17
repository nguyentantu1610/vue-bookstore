import { useGetFetch, usePostOrPatchFetch } from "@/composables/custom-fetch";
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
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);
    return headers;
  }

  /**
   * This function to fetch categories
   *
   * @param uri The fetch uri
   */
  async function getCategories(uri: string) {
    const { data, status } = await useGetFetch(uri, customHeaders());
    results.value = null;
    if (status >= 200 && status <= 299) {
      results.value = data.data;
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
    const { data, status } = await usePostOrPatchFetch(
      method,
      uri,
      formData,
      customHeaders()
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

  return {
    results,
    categoryErrors,
    getCategories,
    createOrUpdateCategory,
    $reset,
  };
});
