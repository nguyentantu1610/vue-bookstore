import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Product from "@/interfaces/product";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useProductsStore = defineStore("products", () => {
  const results = ref();
  const initData: Product = {
    product_id: "",
    name: "",
    author: "",
    translator: "",
    supplier_name: "",
    publisher_name: "",
    publish_year: "",
    category_name: "",
    weight: "",
    cover_size: "",
    pages: "",
    price: 0,
    created_at: "",
    updated_at: "",
    deleted_at: "",
    description: "",
    urls: "",
  };
  const productErrors = ref<Product>(initData);
  const toast = useToast();

  function $reset() {
    productErrors.value = initData;
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
   * This function to fetch products
   *
   * @param uri The fetch uri
   */
  async function getProducts(uri: string) {
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
   * This function to export data to excel file
   *
   */
  async function exportData() {
    if ("showDirectoryPicker" in window) {
      const headers = customHeaders();
      headers.append("Accept", "text/csv");
      const { status, fileName, data } = await useGetFetch(
        "/api/admin/products/export",
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
   * This function to create or update product
   *
   * @param {string} method The fetch method (false is create and vice versa)
   * @param {string} uri The fetch uri
   * @param {Product} formData The fetch body
   */
  async function createOrUpdateProduct(
    method: string,
    uri: string,
    formData: Product
  ) {
    $reset();
    const headers = customHeaders();
    headers.append("Accept", "application/json");
    const { data, status } = await usePostOrPatchFetch<Product>(
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
      productErrors.value = data.errors;
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
      const response = await fetch("/api/admin/products/import", {
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
   * This function to delete product
   *
   * @param uri The fetch uri
   */
  async function deleteProduct(uri: string) {
    const { status } = await useDeleteFetch(uri);
    if (status >= 200 && status <= 299) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Ngừng kích hoạt thành công~",
        life: 3000,
      });
      return;
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Ngừng kích hoạt thất bại",
      life: 3000,
    });
  }

  /**
   * This function to restore supplier
   *
   * @param {string} uri The fetch uri
   */
  async function restoreProduct(uri: string) {
    const { status } = await usePostOrPatchFetch<Product>(
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
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Khôi phục thất bại",
      life: 3000,
    });
  }

  return {
    results,
    productErrors,
    getProducts,
    createOrUpdateProduct,
    deleteProduct,
    $reset,
    exportData,
    restoreProduct,
    importFile,
  };
});
