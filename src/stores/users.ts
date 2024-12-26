import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type User from "@/interfaces/user";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useUsersStore = defineStore("users", () => {
  const toast = useToast();
  // Init data
  const results = ref();
  const initData: User = {
    id: "",
    name: "",
    email: "",
    email_verified_at: "",
    password_reseted_at: "",
    address: "",
    phone_number: "",
    deleted_at: "",
  };
  let headers = new Headers();

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
   * This function to fetch users
   *
   * @param uri The fetch uri
   */
  async function getUsers(uri: string) {
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
        "/api/admin/users/export",
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
   * This function to delete user
   *
   * @param uri The fetch uri
   */
  async function deleteUser(uri: string) {
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
   * This function to restore user
   *
   * @param {string} uri The fetch uri
   */
  async function restoreUser(uri: string) {
    customHeaders();
    const { data, status } = await usePostOrPatchFetch<User>(
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
    getUsers,
    deleteUser,
    exportData,
    restoreUser,
  };
});
