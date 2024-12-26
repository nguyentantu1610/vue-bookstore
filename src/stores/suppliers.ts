import {
  useDeleteFetch,
  useFilePostFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Supplier from "@/interfaces/supplier";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useSuppliersStore = defineStore("suppliers", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const initData: Supplier = {
    id: "",
    supplier_name: "",
    contact_name: "",
    phone_number: "",
    address: "",
  };
  const supplierErrors = ref<Supplier>(initData);
  let headers = new Headers();

  function $reset() {
    supplierErrors.value = initData;
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
   * This function to fetch suppliers
   *
   * @param uri The fetch uri
   */
  async function getSuppliers(uri: string) {
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
        "/api/admin/suppliers/export",
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
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<Supplier>(
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
    status === 422 ? (supplierErrors.value = data.errors) : "";
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
      "/api/admin/suppliers/import",
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
   * This function to delete supplier
   *
   * @param uri The fetch uri
   */
  async function deleteSupplier(uri: string) {
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
   * This function to restore supplier
   *
   * @param {string} uri The fetch uri
   */
  async function restoreSupplier(uri: string) {
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<Supplier>(
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
