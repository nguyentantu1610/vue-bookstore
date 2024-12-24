import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Category from "@/interfaces/category";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useCategoriesStore = defineStore("categories", () => {
  const results = ref();
  const initData: Category = { id: "", name: "", description: "" };
  const categoryErrors = ref<Category>(initData);
  const toast = useToast();

  function $reset() {
    categoryErrors.value = initData;
  }

  // Custom headers for fetch
  function customHeaders(): Headers {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
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
    status >= 200 && status <= 299
      ? (results.value = data.data)
      : (results.value = null);
    if (status === 401) {
      localStorage.removeItem("token");
    }
  }

  /**
   * This function to export data to excel file
   *
   */
  async function exportData() {
    if ("showDirectoryPicker" in window) {
      const headers = customHeaders();
      headers.append("Accept", "text/csv");
      const { status, fileName, data } = await useGetFetch(
        "/api/admin/categories/export",
        headers
      );
      if (status >= 200 && status <= 299) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        const fileHandle = await directoryHandle.getFileHandle(fileName, {
          create: true,
        });
        const writer = await fileHandle.createWritable();
        await writer.write(data);
        await writer.close();
        toast.add({
          severity: "success",
          summary: "Thành công",
          detail: "Xuất file thành công~",
          life: 3000,
        });
        return;
      }
      if (status === 401) {
        localStorage.removeItem("token");
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
   * This function to import excel file
   *
   * @param {any} formData The fetch body
   */
  async function importFile(formData: any) {
    const headers = customHeaders();
    headers.set("Accept", "application/json");
    headers.delete("Content-Type");
    try {
      const response = await fetch("/api/admin/categories/import", {
        method: "POST",
        headers: headers,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422) {
          toast.add({
            severity: "error",
            summary: "Lỗi",
            detail: data.message,
            life: 3000,
          });
        }
        throw new Error(data.message);
      }
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * This function to delete category
   *
   * @param uri The fetch uri
   */
  async function deleteCategory(uri: string) {
    const { status } = await useDeleteFetch(uri);
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: "Xoá danh mục thành công~",
          life: 3000,
        })
      : toast.add({
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
    const { status } = await usePostOrPatchFetch<Category>(
      "PATCH",
      uri,
      initData,
      customHeaders()
    );
    status >= 200 && status <= 299
      ? toast.add({
          severity: "success",
          summary: "Thành công",
          detail: "Khôi phục thành công~",
          life: 3000,
        })
      : toast.add({
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
    exportData,
    restoreCategory,
    importFile,
  };
});
