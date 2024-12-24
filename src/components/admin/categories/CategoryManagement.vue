<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type Category from "@/interfaces/category";
import { storeToRefs } from "pinia";
import { useCategoriesStore } from "@/stores/categories";
import { useConfirm } from "primevue/useconfirm";

const showModal = ref<boolean>(false);
const loading = ref<boolean>(false);
const categories = ref<Array<Category> | null>(new Array<Category>(2));
const columns = ref([
  { field: "description", header: "Mô tả" },
  { field: "created_at", header: "Ngày tạo" },
  { field: "updated_at", header: "Ngày cập nhật" },
  { field: "deleted_at", header: "Tình trạng" },
]);
const selectedColumns = ref(columns.value);
const sortType = ref<string>("desc");
const sortBtnIcon = ref("pi pi-sort-amount-down");
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const {
  getCategories,
  createOrUpdateCategory,
  $reset,
  deleteCategory,
  exportData,
  restoreCategory,
  importFile,
} = useCategoriesStore();
const { results, categoryErrors } = storeToRefs(useCategoriesStore());
const formData = ref<Category>({ id: "", name: "", description: "" });
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
  categories.value = new Array<Category>(2);
  totalPages.value = 0;
  await getCategories(
    `/api/admin/categories?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value !== null) {
      categories.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      categories.value = null;
    }
  }, 1000);
}

const watcher = watchEffect(async () => await getData());

function showDialog() {
  $reset();
  showModal.value = true;
}

const selectRow = (data: Category) => {
  formData.value = data;
  showDialog();
};

async function handleSubmitForm() {
  loading.value = true;
  await createOrUpdateCategory(
    formData.value.id ? "PATCH" : "POST",
    formData.value.id
      ? `/api/admin/categories/${formData.value.id}`
      : "/api/admin/categories",
    formData.value
  );
  loading.value = false;
  if (categoryErrors.value.name === "" && categoryErrors.value.name === "") {
    formData.value = { id: "", name: "", description: "" };
    showModal.value = false;
    await getData();
  }
}

const deleteOrRestoreCategory = (data: Category, event: any) => {
  const isDeleted = data.deleted_at !== null;
  confirm.require({
    target: event.currentTarget,
    message: isDeleted
      ? "Bạn có chắc là muốn khôi phục danh mục này?"
      : "Bạn có chắc là muốn xoá danh mục này?",
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
      isDeleted
        ? await restoreCategory(`/api/admin/categories/restore/${data.id}`)
        : await deleteCategory(`/api/admin/categories/${data.id}`);
      await getData();
    },
    reject: () => {
      console.log(`xoá ${data.name} thất bại~`);
    },
  });
};

async function onFileSelect(event: any) {
  const formData = new FormData();
  formData.append("file", event.files[0]);
  await importFile(formData);
}
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <h1 class="text-3xl font-medium mb-6">Danh Mục Sản Phẩm</h1>
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
      :header="formData.id ? 'Cập nhật danh mục' : 'Thêm mới danh mục'"
      :style="{ width: '25rem' }"
    >
      <form @submit.prevent="handleSubmitForm" class="flex flex-col">
        <div class="w-3/4 self-center mt-1 mb-4">
          <FloatLabel variant="on">
            <InputText
              type="text"
              id="name"
              fluid
              autofocus
              maxlength="50"
              v-model="formData.name"
              :invalid="
                categoryErrors.name !== '' && categoryErrors.name !== undefined
              "
              :disabled="loading"
            />
            <label for="name">Tên</label>
          </FloatLabel>
          <Message
            v-if="categoryErrors.name"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ categoryErrors.name[0] }}
          </Message>
        </div>
        <div class="self-center mb-6 w-3/4">
          <FloatLabel variant="on">
            <InputText
              type="text"
              id="description"
              fluid
              maxlength="50"
              v-model="formData.description"
              :invalid="
                categoryErrors.description !== '' &&
                categoryErrors.description !== undefined
              "
              :disabled="loading"
            />
            <label for="description">Mô tả</label>
          </FloatLabel>
          <Message
            v-if="categoryErrors.description"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ categoryErrors.description[0] }}
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
      :value="categories"
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
      <Column field="name" header="Tên">
        <template #body="{ data }">
          <Skeleton v-if="data === null"></Skeleton>
          <p v-else>{{ data.name }}</p>
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
            icon="pi pi-pencil"
            severity="warn"
            rounded
            @click="selectRow(data)"
          ></Button>
          <Button
            v-if="data !== null"
            :icon="data.deleted_at !== null ? 'pi pi-undo' : 'pi pi-trash'"
            :severity="data.deleted_at !== null ? 'secondary' : 'danger'"
            rounded
            @click="deleteOrRestoreCategory(data, $event)"
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
      <template #empty> Không tìm thấy danh mục trong CSDL. </template>
    </DataTable>
  </div>
</template>
