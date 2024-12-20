import {
  useDeleteFetch,
  useGetFetch,
  usePostOrPatchFetch,
} from "@/composables/custom-fetch";
import type User from "@/interfaces/user";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useUsersStore = defineStore("users", () => {
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
  const toast = useToast();

  // Custom headers for fetch
  function customHeaders(): Headers {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);
    return headers;
  }

  /**
   * This function to fetch users
   *
   * @param uri The fetch uri
   */
  async function getUsers(uri: string) {
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
        "/api/admin/users/export",
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
   * This function to delete user
   *
   * @param uri The fetch uri
   */
  async function deleteUser(uri: string) {
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
   * This function to restore user
   *
   * @param {string} uri The fetch uri
   */
  async function restoreUser(uri: string) {
    const { status } = await usePostOrPatchFetch<User>(
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
    getUsers,
    deleteUser,
    exportData,
    restoreUser,
  };
});
