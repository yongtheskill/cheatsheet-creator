<script setup lang="ts">
import { DisplayFile } from '../types';
import { useSortable } from '@vueuse/integrations/useSortable';
import { ref } from 'vue';

const sortEl = ref<HTMLElement | null>(null);

const files = defineModel<DisplayFile[]>({ required: true });

useSortable(sortEl, files, {
  group: 'files',
  onEnd: (e: any) => {
    console.log(e);
  },
});
</script>

<template>
  <div ref="sortEl">
    <div
      v-for="file in files"
      class="pb-3"
      :key="`${file.settings.id}-${file.path}-${file.settings.id}`">
      <div
        class="border border-gray-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
        <div class="flex justify-between items-center">
          <div class="font-semibold">
            {{ file.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
