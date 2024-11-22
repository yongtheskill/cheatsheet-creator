<script setup lang="ts">
import Stepper from './components/Stepper.vue';
import SelectFiles from './Pages/SelectFiles.vue';
import ConfirmFiles from './Pages/ConfirmFiles.vue';
import Layout from './Pages/Layout.vue';
import Export from './Pages/Export.vue';
import { ref } from 'vue';
import { SelectedItem, SelectedFile, Page } from './types';

const selectedStep = ref(0);
const selectedItems = ref<Map<string, SelectedItem>>(new Map());
const selectedFiles = ref<SelectedFile[]>([]);
const finalPages = ref<{ portrait: boolean; pages: Page[] }>({
  portrait: false,
  pages: [{ columns: [[]] }],
});

function nextStep() {
  selectedStep.value++;
}
</script>

<template>
  <nav class="sticky top-0 z-10 bg-white printHide">
    <Stepper v-model="selectedStep" />
  </nav>
  <main class="flex-1 min-h-0">
    <SelectFiles v-model="selectedItems" v-if="selectedStep === 0" :next-step="nextStep" />
    <ConfirmFiles
      v-model="selectedFiles"
      v-if="selectedStep === 1"
      :selected-items="selectedItems"
      :next-step="nextStep" />
    <Layout
      v-model="finalPages"
      v-if="selectedStep === 2"
      :selected-files="selectedFiles"
      :next-step="nextStep" />
    <Export v-if="selectedStep === 3" :finalPages="finalPages" />
  </main>
</template>
