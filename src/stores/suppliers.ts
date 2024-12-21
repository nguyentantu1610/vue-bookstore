import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Supplier from "@/interfaces/supplier";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useSuppliersStore = defineStore("suppliers", () => {
  const results = ref();
  const initData: Supplier = {
    supplier_name: "",
    contact_name: "",
    phone_number: "",
    address: "",
  };
  const supplierErrors = ref<Supplier>(initData);
  const toast = useToast();

  function $reset() {
    supplierErrors.value = initData;
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
   * This function to fetch suppliers
   *
   * @param uri The fetch uri
   */
  async function getSuppliers(uri: string) {
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
        "/api/admin/suppliers/export",
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
   * This function to create or update supplier
   *
   * @param {string} method The fetch method (false is create and vice versa)
   * @param {string} uri The fetch uri
   * @param {Supplier} formData The fetch body
   */
  async function createOrUpdateSupplier(
    method: string,
    uri: string,
    formData: Supplier
  ) {
    $reset();
    const headers = customHeaders();
    headers.append("Accept", "application/json");
    const { data, status } = await usePostOrPatchFetch<Supplier>(
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
      supplierErrors.value = data.errors;
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
      const response = await fetch("/api/admin/suppliers/import", {
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
   * This function to delete supplier
   *
   * @param uri The fetch uri
   */
  async function deleteSupplier(uri: string) {
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
  async function restoreSupplier(uri: string) {
    const { status } = await usePostOrPatchFetch<Supplier>(
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
    supplierErrors,
    getSuppliers,
    createOrUpdateSupplier,
    deleteSupplier,
    $reset,
    exportData,
    restoreSupplier,
    importFile,
  };
});
