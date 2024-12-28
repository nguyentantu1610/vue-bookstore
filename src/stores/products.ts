import {
  useDeleteFetch,
  useFilePostFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type Product from "@/interfaces/product";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useProductsStore = defineStore("products", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const initData: Product = {
    product_id: "",
    name: "",
    author: "",
    translator: "",
    supplier_id: "",
    publisher_name: "",
    publish_year: "",
    category_id: "",
    weight: "",
    cover_size: "",
    pages: "",
    price: 0,
    created_at: "",
    updated_at: "",
    deleted_at: "",
    description: "",
  };
  const productErrors = ref<Product>(initData);
  let headers = new Headers();

  function $reset() {
    productErrors.value = initData;
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
   * This function to fetch products
   *
   * @param uri The fetch uri
   */
  async function getAll(uri: string) {
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
        "/api/admin/products/export",
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
   * This function is special custom post fetch for this store
   *
   * @param {string} uri The fetch uri
   * @param {FormData} formData The fetch body
   */
  async function specialCustomPostFetch(uri: string, formData: FormData) {
    customHeaders();
    headers.delete("Content-Type");
    const { status, data } = await useFilePostFetch(uri, formData, headers);
    if (status >= 200 && status <= 299) {
      uri === "/api/admin/products"
        ? router.push({ name: "products" })
        : "";
      return toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
    }
    if (status === 422) {
      uri === "/api/admin/products/import"
        ? console.error(data.message)
        : (productErrors.value = data.errors);
    }
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: data.message,
      life: 3000,
    });
  }

  /**
   * This function to create product
   *
   * @param {Product} data The product data
   * @param {FileList|null|undefined} images The product images
   */
  async function createProduct(
    data: Product,
    images: FileList | null | undefined
  ) {
    $reset();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("author", data.author);
    formData.append("translator", data.translator);
    formData.append("supplier_id", (data.supplier_id as any).id);
    formData.append("publisher_name", data.publisher_name);
    const date = new Date(data.publish_year);
    formData.append(
      "publish_year",
      `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    );
    formData.append("category_id", (data.category_id as any).id);
    formData.append("weight", data.weight);
    formData.append("cover_size", data.cover_size);
    formData.append("pages", data.pages);
    formData.append("price", data.price as string);
    formData.append("description", data.description);
    Array.from(images as FileList).forEach((image) => {
      formData.append("images[]", image);
    });
    await specialCustomPostFetch("/api/admin/products", formData);
  }

  /**
   * This function to update product
   *
   * @param {Product} formData The fetch body
   * @param {FileList|null|undefined} images The product images
   */
  async function updateProduct(
    formData: Product,
    images: FileList | null | undefined
  ) {
    $reset();
    customHeaders();
    (formData as any).category_name = (formData.category_id as any).name;
    formData.category_id = (formData.category_id as any).id;
    (formData as any).supplier_name = (
      formData.supplier_id as any
    ).supplier_name;
    formData.supplier_id = (formData.supplier_id as any).id;
    const date = new Date(formData.publish_year);
    formData.publish_year = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const { data, status } = await usePostOrPatchFetch<Product>(
      "PATCH",
      `/api/admin/products/${formData.product_id}`,
      formData,
      headers
    );
    status === 422 ? (productErrors.value = data.errors) : "";
    if (status >= 200 && status <= 299) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: data.message,
        life: 3000,
      });
      if (images?.length) {
        const newForm = new FormData();
        newForm.append("id", formData.product_id);
        Array.from(images as FileList).forEach((image) => {
          newForm.append("images[]", image);
        });
        await specialCustomPostFetch("/api/admin/banners", newForm);
      }
      return;
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
   * @param {FormData} formData The fetch body
   */
  async function importFile(formData: FormData) {
    await specialCustomPostFetch("/api/admin/products/import", formData);
  }

  /**
   * This function to delete product
   *
   * @param uri The fetch uri
   */
  async function deleteProduct(uri: string) {
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
  async function restoreProduct(uri: string) {
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<Product>(
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
    productErrors,
    getAll,
    specialCustomPostFetch,
    createProduct,
    updateProduct,
    deleteProduct,
    $reset,
    exportData,
    restoreProduct,
    importFile,
  };
});
