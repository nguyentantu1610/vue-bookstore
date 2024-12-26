<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import type Product from "@/interfaces/product";
import { useProductsStore } from "@/stores/products";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { productErrors, results } = storeToRefs(useProductsStore());
const { getAll, createProduct, $reset } = useProductsStore();
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
const supplierLoading = ref<boolean>(false);
const categoryLoading = ref<boolean>(false);
const formLoading = ref<boolean>(false);
const images = useTemplateRef<HTMLInputElement>("product-images");

// Handle get supplier from server
async function getSupplier() {
  if (suppliers.value === undefined || suppliers.value === null) {
    supplierLoading.value = true;
    await getAll("/api/admin/suppliers/list");
    setTimeout(() => {
      supplierLoading.value = false;
      suppliers.value = results.value;
    }, 1000);
  }
}

// Handle get category from server
async function getCategory() {
  if (categories.value === undefined || categories.value === null) {
    categoryLoading.value = true;
    await getAll("/api/admin/categories/list");
    setTimeout(() => {
      categoryLoading.value = false;
      categories.value = results.value;
    }, 1000);
  }
}

// Handle create/update product
async function handleSubmitForm() {
  formLoading.value = true;
  id ? "" : await createProduct(formData.value, images.value?.files);
  formLoading.value = false;
}

onMounted(() => $reset());
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <Card>
      <template #title>
        {{ id ? "Cập nhật Sản Phẩm" : "Thêm Mới Sản Phẩm" }}
      </template>
      <template #content>
        <ScrollPanel class="w-full h-3/4 pr-6 pl-6">
          <form
            v-focusTrap
            @submit.prevent="handleSubmitForm"
            class="flex flex-col mt-6"
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
                    :invalid="
                      productErrors.name !== '' &&
                      productErrors.name !== undefined
                    "
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
                    :invalid="
                      productErrors.author !== '' &&
                      productErrors.author !== undefined
                    "
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
                    :invalid="
                      productErrors.translator !== '' &&
                      productErrors.translator !== undefined
                    "
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
                    :invalid="
                      productErrors.supplier_id !== '' &&
                      productErrors.supplier_id !== undefined
                    "
                    :disabled="formLoading"
                    @click="getSupplier"
                    @focus="getSupplier"
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
                    :invalid="
                      productErrors.publisher_name !== '' &&
                      productErrors.publisher_name !== undefined
                    "
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
                    :invalid="
                      productErrors.publish_year !== '' &&
                      productErrors.publish_year !== undefined
                    "
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
                    :invalid="
                      productErrors.category_id !== '' &&
                      productErrors.category_id !== undefined
                    "
                    :disabled="formLoading"
                    @click="getCategory"
                    @focus="getCategory"
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
                    :invalid="
                      productErrors.weight !== '' &&
                      productErrors.weight !== undefined
                    "
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
                    :invalid="
                      productErrors.cover_size !== '' &&
                      productErrors.cover_size !== undefined
                    "
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
                    :invalid="
                      productErrors.pages !== '' &&
                      productErrors.pages !== undefined
                    "
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
                    :invalid="
                      productErrors.price !== 0 &&
                      productErrors.price !== undefined
                    "
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
                    :invalid="
                      productErrors.description !== '' &&
                      productErrors.description !== undefined
                    "
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
                :showUploadButton="id ? true : false"
                cancelLabel="Huỷ"
                class="mr-2"
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
        </ScrollPanel>
      </template>
      <template #footer> </template>
    </Card>
  </div>
</template>
