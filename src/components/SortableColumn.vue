<script setup lang="ts">
import { DisplayFile } from '../types';
import { useSortable } from '@vueuse/integrations/useSortable';
import { computed, ref } from 'vue';
import MdRender from '../components/MdRender.vue';

const emit = defineEmits(['update:column']);

const sortEl = ref<HTMLElement | null>(null);

const props = defineProps<{
  baseSize: number;
  duplicate: (f: DisplayFile) => void;
  column: DisplayFile[];
}>();
// const column = defineModel<DisplayFile[]>({ required: true });

const computedColumn = computed({
  get: () => props.column,
  set: (newValue) => {
    console.log('UPDATED');
    emit('update:column', newValue);
  },
});

useSortable(sortEl, computedColumn, {
  group: 'files',
  onEnd: (e: any) => {
    console.log(e);
  },
});
</script>

<template>
  <div ref="sortEl">
    <div
      v-for="file in column"
      class="cursor-pointer hover:bg-gray-100 transition-colors py-1 px-2 border-b pb-3 border-gray-200"
      :key="`${file.settings.id}-${file.path}-${file.settings.id}`">
      <MdRender
        :name="file.name"
        :path="file.path"
        :baseSize="baseSize"
        :editing="true"
        :duplicate="() => duplicate(file)"
        v-model="file.settings" />
    </div>
  </div>
</template>
