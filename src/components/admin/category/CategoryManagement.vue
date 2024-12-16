<script setup lang="ts">
import { useToast } from "primevue";
import { ref } from "vue";

const visible = ref(false);
const toast = useToast();
const editingRows = ref([]);
const lazyLoad = ref<boolean>(false);
const first = ref();
const products = ref([
  {
    description: "Hello World",
    name: "Bamboo Watch",
    created_at: "16/12/2024",
    updated_at: "16/12/2024",
  },
  {
    description: "Hello World",
    name: "Bamboo Watch1",
    created_at: "16/12/2024",
    updated_at: "16/12/2024",
  },
  {
    description: "Hello World",
    name: "Bamboo Watch2",
    created_at: "16/12/2024",
    updated_at: "16/12/2024",
  },
]);
const columns = ref([
  { field: "description", header: "Mô tả" },
  { field: "created_at", header: "Ngày tạo" },
  { field: "updated_at", header: "Ngày cập nhật" },
]);
const selectedColumns = ref(columns.value);

const onRowEditSave = (event: any) => {
  let { newData, index } = event;

  products.value[index] = newData;
  toast.add({
    severity: "info",
    summary: newData.name,
    detail: newData.created_at + " | " + newData.updated_at,
    life: 3000,
  });
  console.log(products.value);
};

const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
};
const sortBtnIcon = ref("pi pi-sort-amount-up-alt");
function changeIcon() {
  if (sortBtnIcon.value === "pi pi-sort-amount-up-alt") {
    sortBtnIcon.value = "pi pi-sort-amount-down";
  }
  else {
    sortBtnIcon.value = "pi pi-sort-amount-up-alt";
  }
}
</script>

<template>
  <div class="pt-6 pl-10">
    <h1 class="text-3xl font-medium mb-6">Danh mục sản phẩm</h1>

    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Thêm mới"
          icon="pi pi-plus"
          class="mr-2"
          @click="visible = true"
        />
      </template>
      <template #center> </template>
      <template #end>
        <FileUpload
          mode="basic"
          accept="image/*"
          :maxFileSize="1000000"
          label="Chọn file"
          customUpload
          chooseLabel="Chọn file"
          class="mr-2"
          auto
          :chooseButtonProps="{ severity: 'secondary' }"
        />
        <Button label="Xuất file" icon="pi pi-upload" severity="secondary" />
      </template>
    </Toolbar>

    <Dialog
      v-model:visible="visible"
      modal
      header="Edit Profile"
      :style="{ width: '25rem' }"
    >
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
        >Update your information.</span
      >
      <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Username</label>
        <InputText id="username" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">Email</label>
        <InputText id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="visible = false"
        ></Button>
        <Button type="button" label="Save" @click="visible = false"></Button>
      </div>
    </Dialog>

    <DataTable
      :value="products"
      v-model:editingRows="editingRows"
      editMode="row"
      @row-edit-save="onRowEditSave"
      :pt="{
      table: { style: 'min-width: 50rem' },
      column: {
        bodycell: ({ state }: any) => ({
          style:
            state['d_editing'] &&
            'padding-top: 0.75rem; padding-bottom: 0.75rem',
        }),
      },
    }"
      scrollable
      scrollHeight="400px"
      showGridlines
      paginator
      v-model:first="first"
      :rows="1"
      :totalRecords="3"
      resizableColumns
      columnResizeMode="expand"
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
              placeholder="Select Columns"
              class="max-w-60"
            />
          </div> 
          <div class="flex justify-end gap-2 grow">
            <Button :icon="sortBtnIcon" label="Tên"  @click="changeIcon" iconPos="right" />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText placeholder="Tìm kiếm" />
            </IconField>
            <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="lazyLoad = !lazyLoad"
            />
          </div>
        </div>
      </template>
      <Column field="name" header="Tên danh mục">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
        <template #body v-if="lazyLoad">
          <Skeleton></Skeleton>
        </template>
      </Column>
      <Column
        v-for="(col, index) of selectedColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field + '_' + index"
      >
        <template
          #editor="{ data, field }"
          v-if="col.field !== 'created_at' && col.field !== 'updated_at'"
        >
          <InputText v-model="data[field]" />
        </template>
        <template #body v-if="lazyLoad">
          <Skeleton></Skeleton>
        </template>
      </Column>
      <Column
        :rowEditor="true"
        style="width: 10%; min-width: 8rem"
        bodyStyle="text-align:center"
      ></Column>
      <Column class="w-24 !text-end">
        <template #body="{ data }">
          <Button icon="pi pi-trash" severity="secondary" rounded></Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
