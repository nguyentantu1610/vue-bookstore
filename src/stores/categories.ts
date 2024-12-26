import {
  useDeleteFetch,
  useFilePostFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Category from "@/interfaces/category";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useCategoriesStore = defineStore("categories", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const initData: Category = { id: "", name: "", description: "" };
  const categoryErrors = ref<Category>(initData);
  let headers = new Headers();

  function $reset() {
    categoryErrors.value = initData;
  }

  // Custom headers for fetch
  function customHeaders() {
    headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    const token = localStorage.getItem("token");
    return token
      ? headers.append("Authorization", `Bearer ${token}`)
      : router.push({ name: "login" });
  }

  /**
   * This function to fetch categories
   *
   * @param uri The fetch uri
   */
  async function getCategories(uri: string) {
    customHeaders();
    const { data, status } = await useGetFetch(uri, headers);
    status >= 200 && status <= 299
      ? (results.value = data.data)
      : (results.value = null);
  }

  /**
   * This function to export data to excel file
   *
   */
  async function exportData() {
    if ("showDirectoryPicker" in window) {
      customHeaders();
      headers.set("Accept", "application/json, text/csv");
      const { status, fileName, data } = await useGetFetch(
        "/api/admin/categories/export",
        headers
      );
      if (status >= 200 && status <= 299) {
        try {
          const directoryHandle = await (window as any).showDirectoryPicker();
          const fileHandle = await directoryHandle.getFileHandle(fileName, {
            create: true,
          });
          const writer = await fileHandle.createWritable();
          await writer.write(data);
          await writer.close();
          return toast.add({
            severity: "success",
            summary: "Thành công",
            detail: "Xuất file thành công~",
            life: 3000,
          });
        } catch (error) {
          console.error(error);
        }
      }
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: "Xuất file thất bại",
        life: 3000,
      });
    }
  }

  /**
   * This function to create or update category
   *
   * @param {string} method The fetch method (false is create and vice versa)
   * @param {string} uri The fetch uri
   * @param {Category} formData The fetch body
   */
  async function createOrUpdateCategory(
    method: string,
    uri: string,
    formData: Category
  ) {
    $reset();
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<Category>(
      method,
      uri,
      formData,
      headers
    );
    if (status >= 200 && status <= 299) {
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    status === 422 ? (categoryErrors.value = data.errors) : "";
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function to import excel file
   *
   * @param {FormData} formData The fetch body
   */
  async function importFile(formData: FormData) {
    customHeaders();
    headers.delete("Content-Type");
    const { status, data } = await useFilePostFetch(
      "/api/admin/categories/import",
      formData,
      headers
    );
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: data.message,
          life: 3000,
        })
      : toast.add({
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
    customHeaders();
    const { data, status } = await useDeleteFetch(uri, headers);
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: data.message,
          life: 3000,
        })
      : toast.add({
          severity: "error",
          summary: "Lỗi",
          detail: data.message,
          life: 3000,
        });
  }

  /**
   * This function to restore category
   *
   * @param {string} uri The fetch uri
   */
  async function restoreCategory(uri: string) {
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<Category>(
      "PATCH",
      uri,
      initData,
      headers
    );
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: data.message,
          life: 3000,
        })
      : toast.add({
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
    deleteCategory,
    $reset,
    exportData,
    restoreCategory,
    importFile,
  };
});
