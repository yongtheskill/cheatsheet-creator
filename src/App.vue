<script setup lang="ts">
import Stepper from './components/Stepper.vue';
import SelectFiles from './Pages/SelectFiles.vue';
import ConfirmFiles from './Pages/ConfirmFiles.vue';
import Layout from './Pages/Layout.vue';
import { ref } from 'vue';
import { SelectedItem, SelectedFile } from './types';

const selectedStep = ref(0);
const selectedItems = ref<Map<string, SelectedItem>>(
  new Map([
    [
      'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\GEA1000',
      {
        type: 'folder',
        name: 'GEA1000',
        path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\GEA1000',
      },
    ],
    [
      'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\MA1521\\Differentiation.md',
      {
        type: 'file',
        name: 'Differentiation.md',
        path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\MA1521\\Differentiation.md',
      },
    ],
    [
      'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\MA1521\\Implicit Differentiation.md',
      {
        type: 'file',
        name: 'Implicit Differentiation.md',
        path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\MA1521\\Implicit Differentiation.md',
      },
    ],
  ])
);
const selectedFiles = ref<SelectedFile[]>([]);

function nextStep() {
  selectedStep.value++;
}
</script>

<template>
  <nav>
    <Stepper v-model="selectedStep" />
  </nav>
  <main class="flex-1 min-h-0">
    <SelectFiles v-model="selectedItems" v-if="selectedStep === 0" :next-step="nextStep" />
    <ConfirmFiles
      v-model="selectedFiles"
      v-if="selectedStep === 1"
      :selected-items="selectedItems"
      :next-step="nextStep" />
    <Layout v-if="selectedStep === 2" :selected-files="selectedFiles" :next-step="nextStep" />
  </main>
</template>
