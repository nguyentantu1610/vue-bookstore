<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type User from "@/interfaces/user";
import { storeToRefs } from "pinia";
import { useUsersStore } from "@/stores/users";
import { useConfirm } from "primevue/useconfirm";

const users = ref<Array<User> | null>(new Array<User>(2));
const columns = ref([
  { field: "name", header: "Tên người dùng" },
  { field: "address", header: "Địa chỉ" },
  { field: "phone_number", header: "SĐT" },
  { field: "email_verified_at", header: "Ngày tham gia" },
  { field: "deleted_at", header: "Tình trạng" },
]);
const selectedColumns = ref(columns.value);
const sortType = ref<string>("desc");
const sortBtnIcon = ref("pi pi-sort-amount-down");
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const { getUsers, deleteUser, exportData, restoreUser } = useUsersStore();
const { results } = storeToRefs(useUsersStore());
const confirm = useConfirm();

const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
};

function changeSort() {
  if (sortBtnIcon.value === "pi pi-sort-amount-up-alt") {
    sortBtnIcon.value = "pi pi-sort-amount-down";
    sortType.value = "desc";
  } else {
    sortBtnIcon.value = "pi pi-sort-amount-up-alt";
    sortType.value = "asc";
  }
}

async function getData() {
  users.value = new Array<User>(2);
  await getUsers(
    `/api/admin/users?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value !== null) {
      users.value = results.value.data;
      totalPages.value = results.value.total;
    } else {
      users.value = null;
      totalPages.value = 0;
    }
  }, 1000);
}

const watcher = watchEffect(async () => await getData());

const deleteOrRestoreUser = (data: any, event: any) => {
  const isDeleted = data.deleted_at !== null;
  confirm.require({
    target: event.currentTarget,
    message: isDeleted
      ? "Bạn có chắc là muốn khôi phục người dùng này?"
      : "Bạn có chắc là muốn xoá người dùng này?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Huỷ",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: isDeleted ? "Khôi phục" : "Xoá",
      severity: isDeleted ? "" : "danger",
    },
    accept: async () => {
      if (isDeleted) {
        await restoreUser(`/api/admin/users/restore/${data.id}`);
      } else {
        await deleteUser(`/api/admin/users/${data.id}`);
      }
      await getData();
    },
    reject: () => {
      console.log(`xoá ${data.name} thất bại~`);
    },
  });
};
</script>

<template>
  <div class="pt-6 pl-10">
    <h1 class="text-3xl font-medium mb-6">Danh sách người dùng</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Xuất file"
          icon="pi pi-upload"
          severity="secondary"
          @click="exportData"
        />
      </template>
    </Toolbar>

    <DataTable
      :value="users"
      scrollable
      scrollHeight="400px"
      showGridlines
      resizableColumns
      columnResizeMode="expand"
      tableStyle="min-width: 50rem"
      class="overflow-y-hidden"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <div style="text-align: left">
            <MultiSelect
              :modelValue="selectedColumns"
              :options="columns"
              optionLabel="header"
              @update:modelValue="onToggle"
              display="chip"
              placeholder="Chọn cột"
              class="max-w-60"
            />
          </div>
          <div class="flex justify-end gap-2 grow">
            <Button
              :icon="sortBtnIcon"
              label="Email"
              iconPos="right"
              variant="text"
              @click="changeSort"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText placeholder="Tìm kiếm" v-model="searchQuery" />
            </IconField>
            <Button icon="pi pi-refresh" rounded raised @click="getData" />
          </div>
        </div>
      </template>
      <Column field="email" header="Email">
        <template #body="{ data }">
          <Skeleton v-if="data === null"></Skeleton>
          <p v-else>{{ data.email }}</p>
        </template>
      </Column>
      <Column
        v-for="(col, index) of selectedColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field + '_' + index"
      >
        <template #body="{ data }">
          <Skeleton v-if="data === null"></Skeleton>
          <div v-else>
            <Tag
              v-if="col.field === 'deleted_at'"
              :value="data[col.field] === null ? 'Kích hoạt' : 'Vô hiệu'"
              :severity="data[col.field] === null ? 'success' : ''"
            />
            <p v-else>{{ data[col.field] }}</p>
          </div>
        </template>
      </Column>
      <Column class="w-24 space-x-2">
        <template #body="{ data }">
          <Button
            v-if="data !== null"
            :icon="data.deleted_at !== null ? 'pi pi-undo' : 'pi pi-trash'"
            :severity="data.deleted_at !== null ? 'secondary' : 'danger'"
            rounded
            @click="deleteOrRestoreUser(data, $event)"
          ></Button>
          <Skeleton v-else shape="circle" size="3rem"></Skeleton>
        </template>
      </Column>
      <template #footer>
        <Paginator
          v-model:first="page"
          :rows="2"
          :totalRecords="totalPages"
          class="h-12"
        ></Paginator>
      </template>
      <template #empty> Không tìm thấy người dùng trong CSDL. </template>
    </DataTable>
  </div>
</template>
