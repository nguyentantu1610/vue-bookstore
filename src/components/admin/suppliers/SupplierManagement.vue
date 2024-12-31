<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type Supplier from "@/interfaces/supplier";
import { storeToRefs } from "pinia";
import { useSuppliersStore } from "@/stores/suppliers";
import { useConfirm } from "primevue/useconfirm";

const {
  getSuppliers,
  createOrUpdateSupplier,
  deleteSupplier,
  $reset,
  exportData,
  restoreSupplier,
  importFile,
} = useSuppliersStore();
const { results, supplierErrors } = storeToRefs(useSuppliersStore());
const confirm = useConfirm();
//Init data
const showModal = ref<boolean>(false);
const loading = ref<boolean>(false);
const suppliers = ref<Array<Supplier> | null>(new Array<Supplier>(2));
const columns = ref([
  { field: "contact_name", header: "Tên liên lạc" },
  { field: "phone_number", header: "SĐT" },
  { field: "address", header: "Địa chỉ" },
  { field: "created_at", header: "Ngày hợp tác" },
  { field: "deleted_at", header: "Tình trạng" },
]);
const selectedColumns = ref(columns.value);
const sortType = ref<string>("desc");
const sortBtnIcon = ref("pi pi-sort-amount-down");
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const formData = ref<Supplier>({
  id: "",
  supplier_name: "",
  contact_name: "",
  phone_number: "",
  address: "",
});

// Show/hide columns
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter((col) => val.includes(col));
};

// Change sort type/icon
function changeSort() {
  if (sortBtnIcon.value === "pi pi-sort-amount-up-alt") {
    sortBtnIcon.value = "pi pi-sort-amount-down";
    sortType.value = "desc";
  } else {
    sortBtnIcon.value = "pi pi-sort-amount-up-alt";
    sortType.value = "asc";
  }
}

// Get data from server
async function getData() {
  suppliers.value = new Array<Supplier>(2);
  totalPages.value = 0;
  await getSuppliers(
    `/api/admin/suppliers?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value) {
      suppliers.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      suppliers.value = null;
    }
  }, 1000);
}

// Watch search query/sort type and page change
const watcher = watchEffect(async () => await getData());

// Show dialog for create/update supplier
function showDialog() {
  $reset();
  showModal.value = true;
}

// Get data for update from choosen row
const selectRow = (data: Supplier) => {
  formData.value = data;
  showDialog();
};

// Handle create/update supplier
async function handleSubmitForm() {
  loading.value = true;
  await createOrUpdateSupplier(
    formData.value.id ? "PATCH" : "POST",
    formData.value.id
      ? `/api/admin/suppliers/${formData.value.id}`
      : "/api/admin/suppliers",
    formData.value
  );
  loading.value = false;
  if (
    !supplierErrors.value.supplier_name &&
    !supplierErrors.value.contact_name &&
    !supplierErrors.value.phone_number &&
    !supplierErrors.value.address
  ) {
    formData.value = {
      id: "",
      supplier_name: "",
      contact_name: "",
      phone_number: "",
      address: "",
    };
    showModal.value = false;
    await getData();
  }
}

// Handle delete/restore supplier
const deleteOrRestoreSupplier = (data: Supplier, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: data.deleted_at
      ? "Bạn có chắc là muốn khôi phục mục này?"
      : "Bạn có chắc là muốn xoá mục này?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Huỷ",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: data.deleted_at ? "Khôi phục" : "Xoá",
      severity: data.deleted_at ? "" : "danger",
    },
    accept: async () => {
      data.deleted_at
        ? await restoreSupplier(`/api/admin/suppliers/restore/${data.id}`)
        : await deleteSupplier(`/api/admin/suppliers/${data.id}`);
      await getData();
    },
    reject: () => console.log(`xoá ${data.supplier_name} thất bại~`),
  });
};

// Handle upload file
async function onFileSelect(event: any) {
  const formData = new FormData();
  formData.append("file", event.files[0]);
  await importFile(formData);
}
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <h1 class="text-3xl font-medium mb-6">Danh Sách Nhà Cung Cấp</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Thêm mới"
          icon="pi pi-plus"
          class="mr-2"
          @click="showDialog()"
        />
      </template>
      <template #end>
        <FileUpload
          mode="basic"
          name="file"
          accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          :maxFileSize="1000000"
          label="Import"
          customUpload
          chooseLabel="Chọn file"
          class="mr-2"
          auto
          :chooseButtonProps="{ severity: 'secondary' }"
          @select="onFileSelect"
        />
        <Button
          label="Xuất file"
          icon="pi pi-upload"
          severity="secondary"
          @click="exportData"
        />
      </template>
    </Toolbar>
    <Dialog
      v-model:visible="showModal"
      modal
      :header="
        formData.id
          ? 'Cập nhật thông tin nhà cung cấp'
          : 'Thêm mới nhà cung cấp'
      "
      :style="{ width: '25rem' }"
    >
      <form @submit.prevent="handleSubmitForm" class="flex flex-col">
        <div class="w-3/4 self-center mt-1 mb-4">
          <FloatLabel variant="on">
            <InputText
              type="text"
              id="supplier-name"
              fluid
              autofocus
              maxlength="50"
              v-model="formData.supplier_name"
              :invalid="!!supplierErrors.supplier_name"
              :disabled="loading"
            />
            <label for="supplier-name">Tên nhà cung cấp</label>
          </FloatLabel>
          <Message
            v-if="supplierErrors.supplier_name"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ supplierErrors.supplier_name[0] }}
          </Message>
        </div>
        <div class="self-center mb-6 w-3/4">
          <FloatLabel variant="on">
            <InputText
              type="text"
              id="contact-name"
              fluid
              maxlength="50"
              v-model="formData.contact_name"
              :invalid="!!supplierErrors.contact_name"
              :disabled="loading"
            />
            <label for="contact-name">Tên liên lạc</label>
          </FloatLabel>
          <Message
            v-if="supplierErrors.contact_name"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ supplierErrors.contact_name[0] }}
          </Message>
        </div>
        <div class="self-center mb-6 w-3/4">
          <FloatLabel variant="on">
            <InputMask
              id="phone-number"
              fluid
              v-model="formData.phone_number"
              mask="0999999999"
              :invalid="!!supplierErrors.phone_number"
              :disabled="loading"
            />
            <label for="phone-number">Số điện thoại</label>
          </FloatLabel>
          <Message
            v-if="supplierErrors.phone_number"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ supplierErrors.phone_number[0] }}
          </Message>
        </div>
        <div class="self-center mb-6 w-3/4">
          <FloatLabel variant="on">
            <InputText
              type="text"
              id="address"
              fluid
              maxlength="255"
              v-model="formData.address"
              :invalid="!!supplierErrors.address"
              :disabled="loading"
            />
            <label for="address">Địa chỉ</label>
          </FloatLabel>
          <Message
            v-if="supplierErrors.address"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ supplierErrors.address[0] }}
          </Message>
        </div>
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Huỷ"
            severity="secondary"
            @click="showModal = false"
          ></Button>
          <Button type="submit" label="Lưu" :loading="loading"></Button>
        </div>
      </form>
    </Dialog>
    <DataTable
      :value="suppliers"
      scrollable
      scrollHeight="400px"
      showGridlines
      resizableColumns
      columnResizeMode="expand"
      tableStyle="min-width: 50rem"
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
              class="max-w-96"
            />
          </div>
          <div class="flex justify-end gap-2 grow">
            <Button
              :icon="sortBtnIcon"
              label="Tên"
              iconPos="right"
              variant="text"
              @click="changeSort"
            />
            <IconField>
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText placeholder="Tìm kiếm" v-model="searchQuery" />
            </IconField>
            <Button icon="pi pi-refresh" rounded raised @click="getData" />
          </div>
        </div>
      </template>
      <Column field="supplier_name" header="Tên nhà cung cấp">
        <template #body="{ data }">
          <Skeleton v-if="!data"></Skeleton>
          <p v-else class="max-w-52">{{ data.supplier_name }}</p>
        </template>
      </Column>
      <Column
        v-for="(col, index) of selectedColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field + '_' + index"
      >
        <template #body="{ data }">
          <Skeleton v-if="!data"></Skeleton>
          <div v-else>
            <Tag
              v-if="col.field === 'deleted_at'"
              :value="!data[col.field] ? 'Kích hoạt' : 'Vô hiệu'"
              :severity="!data[col.field] ? 'success' : ''"
            />
            <p v-else class="max-w-52">{{ data[col.field] }}</p>
          </div>
        </template>
      </Column>
      <Column class="w-24 space-x-2">
        <template #body="{ data }">
          <Button
            v-if="data"
            icon="pi pi-pencil"
            severity="warn"
            rounded
            @click="selectRow(data)"
          ></Button>
          <Button
            v-if="data"
            :icon="data.deleted_at ? 'pi pi-undo' : 'pi pi-trash'"
            :severity="data.deleted_at ? 'secondary' : 'danger'"
            rounded
            @click="deleteOrRestoreSupplier(data, $event)"
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
      <template #empty>
        Không tìm thấy thông tin nhà cung cấp trong CSDL.
      </template>
    </DataTable>
  </div>
</template>
