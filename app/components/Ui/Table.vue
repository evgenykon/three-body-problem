<script setup lang="ts">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  striped?: boolean
}

withDefaults(defineProps<Props>(), {
  striped: true
})
</script>

<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="table-th"
            :style="{ textAlign: col.align || 'left' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="index"
          class="table-tr"
          :class="{ 'table-tr--striped': striped && index % 2 === 1 }"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="table-td"
            :style="{ textAlign: col.align || 'left' }"
          >
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-th {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

.table-tr {
  border-bottom: 1px solid var(--border);
}

.table-tr--striped {
  background: var(--muted);
}

.table-td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--foreground);
}

.table-tr:hover {
  background: var(--accent);
}
</style>