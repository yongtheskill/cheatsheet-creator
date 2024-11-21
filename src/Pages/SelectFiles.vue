<script setup lang="ts">
import FileExplorer from '../components/FileExplorer.vue';
import SelectedItems from '../components/SelectedItems.vue';
import { SelectedItem } from '../types';

const selectedFiles = defineModel<Map<string, SelectedItem>>({ required: true });

defineProps<{
  nextStep: () => void;
}>();
</script>

<template>
  <div class="px-36 py-7 h-full">
    <div class="border border-gray-200 rounded-xl h-full flex justify-between">
      <div class="flex-1 min-h-0 relative">
        <FileExplorer v-model="selectedFiles" />
      </div>
      <div class="w-96 border-l border-gray-200">
        <SelectedItems v-model="selectedFiles" :next-step="nextStep" />
      </div>
    </div>
  </div>
</template>
