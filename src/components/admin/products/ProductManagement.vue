<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type Product from "@/interfaces/product";
import { storeToRefs } from "pinia";
import { useProductsStore } from "@/stores/products";
import { useConfirm } from "primevue/useconfirm";

const products = ref<Array<Product> | null>(new Array<Product>(2));
const columns = ref([
  { field: "author", header: "Tác giả" },
  { field: "translator", header: "Người dịch" },
  { field: "supplier_name", header: "Nhà cung cấp" },
  { field: "publisher_name", header: "Nhà xuất bản" },
  { field: "publish_year", header: "Năm xuất bản" },
  { field: "category_name", header: "Tên danh mục" },
  { field: "weight", header: "Khối lượng" },
  { field: "cover_size", header: "Bìa" },
  { field: "pages", header: "Số trang" },
  { field: "price", header: "Giá" },
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
const { getProducts, deleteProduct, exportData, restoreProduct, importFile } =
  useProductsStore();
const { results } = storeToRefs(useProductsStore());
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
  products.value = new Array<Product>(2);
  totalPages.value = 0;
  await getProducts(
    `/api/admin/products?sort_type=${sortType.value}&page=${
      page.value / 2 + 1
    }&search_query=${searchQuery.value}`
  );
  setTimeout(() => {
    if (results.value !== null) {
      products.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      products.value = null;
    }
  }, 1000);
}

const watcher = watchEffect(async () => await getData());

const deleteOrRestoreProduct = (data: Product, event: any) => {
  const isDeleted = data.deleted_at !== null;
  confirm.require({
    target: event.currentTarget,
    message: isDeleted
      ? "Bạn có chắc là muốn khôi phục sản phẩm này?"
      : "Bạn có chắc là muốn xoá sản phẩm này?",
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
        ? await restoreProduct(`/api/admin/products/restore/${data.product_id}`)
        : await deleteProduct(`/api/admin/products/${data.product_id}`);
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
    <h1 class="text-3xl font-medium mb-6">Danh Sách Sản Phẩm</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button
          as="router-link"
          label="Thêm mới"
          icon="pi pi-plus"
          class="mr-2"
          :to="{ name: 'product-detail' }"
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
    <DataTable
      :value="products"
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
      <Column class="w-24 space-x-2">
        <template #body="{ data }">
          <Button
            v-if="data !== null"
            as="router-link"
            icon="pi pi-pencil"
            severity="warn"
            rounded
            :to="{ name: 'product-detail', params: { id: data.product_id } }"
          ></Button>
          <Button
            v-if="data !== null"
            :icon="data.deleted_at !== null ? 'pi pi-undo' : 'pi pi-trash'"
            :severity="data.deleted_at !== null ? 'secondary' : 'danger'"
            rounded
            @click="deleteOrRestoreProduct(data, $event)"
          ></Button>
          <Skeleton v-else shape="circle" size="3rem"></Skeleton>
        </template>
      </Column>
      <Column field="name" header="Tên sản phẩm">
        <template #body="{ data }">
          <Skeleton v-if="data === null"></Skeleton>
          <p v-else>{{ data.name }}</p>
        </template>
      </Column>
      <Column field="urls" header="Hình ảnh">
        <template #body="{ data }">
          <Skeleton v-if="data === null"></Skeleton>
          <img
            v-else
            :src="data.urls ? data.urls.split(',')[0] : '/default_image.png'"
            :alt="data.name"
            class="w-24 rounded"
          />
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
      <template #footer>
        <Paginator
          v-model:first="page"
          :rows="2"
          :totalRecords="totalPages"
          class="h-12"
        ></Paginator>
      </template>
      <template #empty>
        Không tìm thấy thông tin sản phẩm trong CSDL.
      </template>
    </DataTable>
  </div>
</template>
