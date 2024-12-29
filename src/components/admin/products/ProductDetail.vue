<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import type Product from "@/interfaces/product";
import { useProductsStore } from "@/stores/products";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useConfirm } from "primevue";

const route = useRoute();
const { productErrors, results } = storeToRefs(useProductsStore());
const {
  getAll,
  createProduct,
  updateProduct,
  $reset,
  restoreProduct,
  deleteProduct,
} = useProductsStore();
// Init data
const id = route.params.id ? route.params.id : null;
const formData = ref<Product>({
  product_id: "",
  name: "",
  author: "",
  translator: "",
  supplier_id: "",
  publisher_name: "",
  publish_year: "",
  category_id: "",
  weight: "1",
  cover_size: "",
  pages: "1",
  price: 0,
  created_at: "",
  updated_at: "",
  deleted_at: "",
  description: "",
});
const suppliers = ref();
const categories = ref();
const banners = ref();
const supplierLoading = ref<boolean>(false);
const categoryLoading = ref<boolean>(false);
const formLoading = ref<boolean>(false);
const images = useTemplateRef<HTMLInputElement>("product-images");
const totalPages = ref<number>(0);
const confirm = useConfirm();

// Handle get supplier from server
async function getSuppliers() {
  if (!suppliers.value) {
    supplierLoading.value = true;
    await getAll("/api/suppliers/list");
    setTimeout(() => {
      results.value ? (suppliers.value = results.value) : "";
      supplierLoading.value = false;
    }, 1000);
  }
}

// Handle get category from server
async function getCategories() {
  if (!categories.value) {
    categoryLoading.value = true;
    await getAll("/api/categories/list");
    setTimeout(() => {
      results.value ? (categories.value = results.value) : "";
      categoryLoading.value = false;
    }, 1000);
  }
}

// Handle get product's images
async function getImages() {
  await getAll(`/api/admin/banners/${formData.value.product_id}`);
  setTimeout(() => {
    if (results.value) {
      banners.value = results.value;
      totalPages.value = banners.value.length;
    }
  }, 1000);
}

// Handle delete/restore image
const deleteOrRestoreImage = (data: any, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: data.deleted_at
      ? "Bạn có chắc là muốn khôi phục hình ảnh này?"
      : "Bạn có chắc là muốn xoá hình ảnh này?",
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
        ? await restoreProduct(`/api/admin/banners/restore/${data.id}`)
        : await deleteProduct(`/api/admin/banners/${data.id}`);
      await getImages();
    },
    reject: () => console.log(`xoá ${data.id} thất bại~`),
  });
};

// Handle create/update product
async function handleSubmitForm() {
  formLoading.value = true;
  if (id) {
    await updateProduct(formData.value, images.value?.files);
    castSelectData();
  } else {
    await createProduct(formData.value, images.value?.files);
  }
  formLoading.value = false;
}

// Cast category and supplier to object
function castSelectData() {
  formData.value.category_id = {
    name: (formData.value as any).category_name,
    id: formData.value.category_id,
  } as unknown as string;
  formData.value.supplier_id = {
    supplier_name: (formData.value as any).supplier_name,
    id: formData.value.supplier_id,
  } as unknown as string;
}

onMounted(async () => {
  $reset();
  // If id is present then get the product information
  if (id) {
    await getAll(`/api/admin/products/${id}`);
    if (results.value) {
      formData.value = results.value;
      castSelectData();
      getImages();
    }
  }
});
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <Card>
      <template #title>
        {{ id ? "Cập Nhật Sản Phẩm" : "Thêm Mới Sản Phẩm" }}
      </template>
      <template #content>
        <form
          v-focusTrap
          @submit.prevent="handleSubmitForm"
          class="flex flex-col mt-6 pr-6 pl-6"
        >
          <div class="flex flex-row gap-4 mb-6">
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="name"
                  fluid
                  autofocus
                  maxlength="50"
                  v-model="formData.name"
                  :invalid="!!productErrors.name"
                  :disabled="formLoading"
                />
                <label for="name">Tên sản phẩm</label>
              </FloatLabel>
              <Message
                v-if="productErrors.name"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.name[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="author"
                  fluid
                  maxlength="50"
                  v-model="formData.author"
                  :invalid="!!productErrors.author"
                  :disabled="formLoading"
                />
                <label for="author">Tên tác giả</label>
              </FloatLabel>
              <Message
                v-if="productErrors.author"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.author[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="translator"
                  fluid
                  maxlength="50"
                  v-model="formData.translator"
                  :invalid="!!productErrors.translator"
                  :disabled="formLoading"
                />
                <label for="translator">Tên Người dịch</label>
              </FloatLabel>
              <Message
                v-if="productErrors.translator"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.translator[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <Select
                  inputId="supplier-id"
                  fluid
                  checkmark
                  :highlightOnSelect="false"
                  filter
                  v-model="formData.supplier_id"
                  :options="suppliers"
                  optionLabel="supplier_name"
                  :loading="supplierLoading"
                  :invalid="!!productErrors.supplier_id"
                  :disabled="formLoading"
                  @focus="getSuppliers"
                  @click="getSuppliers"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ slotProps.value.supplier_name }}
                    </div>
                  </template>
                  <template #option="slotProps">
                    <div>{{ slotProps.option.supplier_name }}</div>
                  </template>
                  <template #dropdownicon>
                    <i class="pi pi-building" />
                  </template>
                  <template #header>
                    <div class="font-medium p-3">Danh sách nhà cung cấp</div>
                  </template>
                  <template #footer>
                    <div class="p-3">
                      <Button
                        as="router-link"
                        label="Thêm mới"
                        fluid
                        severity="secondary"
                        text
                        size="small"
                        icon="pi pi-plus"
                        :to="{ name: 'suppliers' }"
                      />
                    </div>
                  </template>
                </Select>
                <label for="supplier-id">
                  {{ supplierLoading ? "Đang tải..." : "Tên nhà cung cấp" }}
                </label>
              </FloatLabel>
              <Message
                v-if="productErrors.supplier_id"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.supplier_id[0] }}
              </Message>
            </div>
          </div>
          <div class="flex flex-row gap-4 mb-6">
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="publisher-name"
                  fluid
                  maxlength="50"
                  v-model="formData.publisher_name"
                  :invalid="!!productErrors.publisher_name"
                  :disabled="formLoading"
                />
                <label for="publisher-name">Tên nhà xuất bản</label>
              </FloatLabel>
              <Message
                v-if="productErrors.publisher_name"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.publisher_name[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <DatePicker
                  id="publish-year"
                  showIcon
                  fluid
                  iconDisplay="input"
                  showButtonBar
                  v-model="((formData.publish_year as unknown) as Date)"
                  :invalid="!!productErrors.publish_year"
                  :disabled="formLoading"
                />
                <label for="publish-year">Năm xuất bản</label>
              </FloatLabel>
              <Message
                v-if="productErrors.publish_year"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.publish_year[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <Select
                  inputId="category-id"
                  fluid
                  checkmark
                  :highlightOnSelect="false"
                  filter
                  v-model="formData.category_id"
                  :options="categories"
                  optionLabel="name"
                  :loading="categoryLoading"
                  :invalid="!!productErrors.category_id"
                  :disabled="formLoading"
                  @focus="getCategories"
                  @click="getCategories"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ slotProps.value.name }}
                    </div>
                  </template>
                  <template #option="slotProps">
                    <div>{{ slotProps.option.name }}</div>
                  </template>
                  <template #dropdownicon><i class="pi pi-tag" /></template>
                  <template #header>
                    <div class="font-medium p-3">Danh sách danh mục</div>
                  </template>
                  <template #footer>
                    <div class="p-3">
                      <Button
                        as="router-link"
                        label="Thêm mới"
                        fluid
                        severity="secondary"
                        text
                        size="small"
                        icon="pi pi-plus"
                        :to="{ name: 'categories' }"
                      />
                    </div>
                  </template>
                </Select>
                <label for="category-id">
                  {{ categoryLoading ? "Đang tải..." : "Tên danh mục" }}
                </label>
              </FloatLabel>
              <Message
                v-if="productErrors.category_id"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.category_id[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputNumber
                  inputId="weight"
                  fluid
                  :useGrouping="false"
                  :min="1"
                  :max="9999"
                  suffix=" gr"
                  v-model="((formData.weight as unknown) as number)"
                  :invalid="!!productErrors.weight"
                  :disabled="formLoading"
                />
                <label for="weight">Khối lượng</label>
              </FloatLabel>
              <Message
                v-if="productErrors.weight"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.weight[0] }}
              </Message>
            </div>
          </div>
          <div class="flex flex-row gap-4 mb-6">
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="cover-size"
                  fluid
                  maxlength="50"
                  v-model="formData.cover_size"
                  :invalid="!!productErrors.cover_size"
                  :disabled="formLoading"
                />
                <label for="cover-size">Loại bìa</label>
              </FloatLabel>
              <Message
                v-if="productErrors.cover_size"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.cover_size[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputNumber
                  inputId="pages"
                  fluid
                  :useGrouping="false"
                  :min="1"
                  :max="9999"
                  v-model="((formData.pages as unknown) as number)"
                  :invalid="!!productErrors.pages"
                  :disabled="formLoading"
                />
                <label for="pages">Số trang</label>
              </FloatLabel>
              <Message
                v-if="productErrors.pages"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.pages[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <InputNumber
                  inputId="price"
                  fluid
                  :min="1"
                  :max="1000000"
                  mode="currency"
                  currency="VND"
                  locale="vi-VN"
                  v-model="(formData.price as number)"
                  :invalid="!!productErrors.price"
                  :disabled="formLoading"
                />
                <label for="price">Giá tiền</label>
              </FloatLabel>
              <Message
                v-if="productErrors.price"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ (productErrors.price as string)[0] }}
              </Message>
            </div>
            <div class="basis-1/4">
              <FloatLabel variant="on">
                <Textarea
                  id="description"
                  fluid
                  rows="1"
                  v-model="formData.description"
                  :invalid="!!productErrors.description"
                  :disabled="formLoading"
                />
                <label for="description">Mô tả</label>
              </FloatLabel>
              <Message
                v-if="productErrors.description"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.description[0] }}
              </Message>
            </div>
          </div>
          <div class="mb-4">
            <FileUpload
              ref="product-images"
              name="file[]"
              :multiple="true"
              accept="image/*"
              :maxFileSize="1000000"
              label="Import"
              chooseLabel="Chọn file"
              :showUploadButton="false"
              upload
              cancelLabel="Huỷ"
              class="mr-2"
              :disabled="formLoading"
            >
              <template #empty>
                <span>Kéo và thả files vào đây để tải lên.</span>
              </template>
            </FileUpload>
          </div>
          <div>
            <Button
              type="submit"
              :label="id ? 'Cập nhật' : 'Thêm mới'"
              :loading="formLoading"
            ></Button>
          </div>
        </form>
        <DataView
          :value="banners"
          data-key="1"
          layout="grid"
          paginator
          :rows="totalPages"
          class="mr-6 ml-6"
          v-if="formData.product_id"
        >
          <template #header>
            <div class="flex items-center">
              <h1 class="text-xl font-medium mt-6">Danh Sách Hình Ảnh</h1>
              <div class="flex justify-end grow">
                <Button
                  icon="pi pi-refresh"
                  rounded
                  raised
                  @click="getImages"
                />
              </div>
            </div>
          </template>
          <template #grid="slotProps">
            <div class="grid grid-cols-12 gap-4">
              <div
                v-for="(item, index) in slotProps.items"
                :key="index"
                class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2"
              >
                <div
                  class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col"
                >
                  <div class="bg-surface-50 flex justify-center rounded">
                    <div class="relative mx-auto">
                      <img
                        class="rounded object-cover w-40 h-52"
                        :src="item.url"
                        :alt="formData.name"
                      />
                      <div
                        class="absolute bg-zinc-900 rounded-lg"
                        style="left: 4px; bottom: 4px"
                      >
                        <Tag
                          :value="item.deleted_at ? 'Vô hiệu' : 'Kích hoạt'"
                          :severity="item.deleted_at ? '' : 'success'"
                        ></Tag>
                      </div>
                      <div class="absolute" style="right: 4px; top: 4px">
                        <Button
                          :icon="item.deleted_at ? 'pi pi-undo' : 'pi pi-trash'"
                          raised
                          rounded
                          class="max-w-7 max-h-7"
                          aria-label="Filter"
                          :severity="item.deleted_at ? 'secondary' : 'danger'"
                          @click="deleteOrRestoreImage(item, $event)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #empty> Sản phẩm này chưa có hình ảnh nào</template>
        </DataView>
      </template>
    </Card>
  </div>
</template>
