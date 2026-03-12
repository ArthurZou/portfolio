<script setup lang="ts">
const budgetInput = ref<number | undefined>()
const loading = ref(false)
const errorMsg = ref('')
const pickerData = ref<any[]>([])
const pickerSummary = ref<any>(null)

const columns = [
  { accessorKey: 'name', header: '药品名称' },
  { accessorKey: 'spec', header: '规格' },
  { accessorKey: 'quantity', header: '数量' },
  { accessorKey: 'unit_price', header: '单价' },
  { accessorKey: 'total_price', header: '小计' }
]

async function submitPicker() {
  if (!budgetInput.value || budgetInput.value <= 0) {
    errorMsg.value = '请输入有效的正整数金额'
    return
  }

  loading.value = true
  errorMsg.value = ''
  pickerData.value = []
  pickerSummary.value = null

  try {
    const result = await $fetch('/api/picker', {
      method: 'POST',
      body: { budget: budgetInput.value }
    })
    pickerData.value = (result as any).data || []
    pickerSummary.value = (result as any).summary || null
    if (pickerData.value.length === 0) {
      errorMsg.value = '未找到满足条件的药品组合'
    }
  } catch (e: any) {
    errorMsg.value = e.data?.message || e.statusMessage || '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPageCard class="p-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: form area -->
      <div class="flex flex-col gap-4">
        <h3 class="text-lg font-semibold">
          药品组合选择器
        </h3>
        <form
          class="flex items-end gap-3"
          @submit.prevent="submitPicker"
        >
          <UFormField label="总金额">
            <UInput
              v-model="budgetInput"
              type="number"
              placeholder="请输入预算金额"
              :min="1"
              :step="1"
            />
          </UFormField>
          <UButton
            type="submit"
            :loading="loading"
            label="计算"
          />
        </form>
        <p
          v-if="errorMsg"
          class="text-red-500 text-sm"
        >
          {{ errorMsg }}
        </p>
      </div>
      <!-- Right: illustration -->
      <div class="hidden lg:block relative overflow-hidden">
        <img
          src="/images/drug-picker.svg"
          alt="药品插画"
          class="absolute inset-0 w-full h-full object-cover"
        >
      </div>
    </div>

    <!-- Results table (full width) -->
    <div
      v-if="pickerData.length || pickerSummary"
      class="mt-6 flex flex-col gap-4"
    >
      <UTable
        v-if="pickerData.length"
        :columns="columns"
        :data="pickerData"
      />
      <div
        v-if="pickerSummary"
        class="flex gap-4 text-sm text-muted"
      >
        <span>预算: {{ pickerSummary.budget }}</span>
        <span>总计: {{ pickerSummary.total }}</span>
        <span>差额: {{ pickerSummary.diff }}</span>
      </div>
    </div>
  </UPageCard>
</template>
