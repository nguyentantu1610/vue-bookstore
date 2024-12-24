<script setup lang="ts">
import type Product from "@/interfaces/product";
import { useProductsStore } from "@/stores/products";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const formData = ref<Product>({
  product_id: "",
  name: "",
  author: "",
  translator: "",
  supplier_name: "",
  publisher_name: "",
  publish_year: "",
  category_name: "",
  weight: "",
  cover_size: "",
  pages: "",
  price: 0,
  created_at: "",
  updated_at: "",
  deleted_at: "",
  description: "",
  urls: "",
});
const { productErrors } = storeToRefs(useProductsStore());
const loading = ref<boolean>(false);
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <Card>
      <template #title>
        {{
          $route.params.id ? "Cập nhật Sản Phẩm" : "Thêm Mới Sản Phẩm"
        }}</template
      >
      <template #content>
        <ScrollPanel style="width: 100%; height: 200px">
          <form class="flex flex-col mt-6">
            <div class="flex flex-row">
              <div>
                <FloatLabel variant="on">
                  <InputText
                    type="text"
                    id="supplier-name"
                    fluid
                    autofocus
                    maxlength="50"
                    v-model="formData.supplier_name"
                    :invalid="
                      productErrors.supplier_name !== '' &&
                      productErrors.supplier_name !== undefined
                    "
                    :disabled="loading"
                  />
                  <label for="supplier-name">Tên nhà cung cấp</label>
                </FloatLabel>
                <Message
                  v-if="productErrors.supplier_name"
                  size="small"
                  severity="error"
                  variant="simple"
                >
                  {{ productErrors.supplier_name[0] }}
                </Message>
              </div>
              <FloatLabel variant="on">
                <InputText
                  type="text"
                  id="supplier-name"
                  fluid
                  autofocus
                  maxlength="50"
                  v-model="formData.supplier_name"
                  :invalid="
                    productErrors.supplier_name !== '' &&
                    productErrors.supplier_name !== undefined
                  "
                  :disabled="loading"
                />
                <label for="supplier-name">Tên nhà cung cấp</label>
              </FloatLabel>
              <Message
                v-if="productErrors.supplier_name"
                size="small"
                severity="error"
                variant="simple"
              >
                {{ productErrors.supplier_name[0] }}
              </Message>
            </div>
            <div>Hello 2</div>
          </form>
        </ScrollPanel>
      </template>
      <template #footer> </template>
    </Card>
    <!-- <h1 class="text-3xl font-medium mb-6"></h1> -->
  </div>
</template>
