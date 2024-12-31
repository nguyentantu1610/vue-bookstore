<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";

const { updateCart, removeCart } = useCartStore();
const { carts } = storeToRefs(useCartStore());
const filters = ref({
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});
</script>

<template>
  <div class="flex flex-col items-center">
    <Card class="w-5/6 mt-8">
      <template #title>Giỏ Hàng</template>
      <template #content>
        <DataTable
          :value="carts"
          showGridlines
          paginator
          :rows="5"
          removableSort
          v-model:filters="filters"
          filterDisplay="row"
          :globalFilterFields="['name']"
          scrollable
          scrollHeight="500px"
          resizableColumns
          columnResizeMode="expand"
          tableStyle="min-width: 50rem"
          class="mt-3"
        >
          <Column field="url" header="Hình ảnh" class="w-40">
            <template #body="{ data }">
              <img
                :src="data.url ? data.url.split(',')[0] : '/default_image.png'"
                :alt="data.name"
                class="w-24 rounded object-cover h-32 place-self-center"
              />
            </template>
          </Column>
          <Column field="name" header="Tên" sortable>
            <template #body="{ data }">
              {{ data.name }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                placeholder="Tìm theo tên"
              />
            </template>
          </Column>
          <Column field="price" header="Giá" sortable>
            <template #body="{ data }">
              <p class="place-self-center">
                {{
                  data.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                }}
              </p>
            </template>
          </Column>
          <Column field="quantity" header="Số lượng">
            <template #body="{ data }">
              <p class="place-self-center">
                <InputNumber
                  v-model="data.quantity"
                  showButtons
                  buttonLayout="horizontal"
                  :min="1"
                  :max="99"
                  :pt="{
                    pcInputText: { root: { class: 'w-12 text-center' } },
                  }"
                  @value-change="updateCart(data.product_id, $event)"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </p>
            </template>
          </Column>
          <Column class="w-24">
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                class="place-self-center"
                @click="removeCart(data.product_id)"
              ></Button>
            </template>
          </Column>
          <template #empty> Không có sản phẩm nào trong giỏ hàng. </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
