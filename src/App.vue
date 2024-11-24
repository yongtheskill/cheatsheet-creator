<script setup lang="ts">
import Stepper from './components/Stepper.vue';
import SelectFiles from './Pages/SelectFiles.vue';
import ConfirmFiles from './Pages/ConfirmFiles.vue';
import Layout from './Pages/Layout.vue';
import Export from './Pages/Export.vue';
import { ref, watch } from 'vue';
import { SelectedItem, SelectedFile, Page } from './types';

const selectedStep = ref(2);
const selectedItems = ref<Map<string, SelectedItem>>(new Map());
const selectedFiles = ref<SelectedFile[]>([]);
// const finalPages = ref<{ portrait: boolean; pages: Page[] }>({
//   portrait: false,
//   pages: [{ columns: [[]] }],
// });

const finalPages = ref<{ portrait: boolean; pages: Page[] }>({
  portrait: true,
  pages: [
    {
      columns: [
        [
          {
            name: 'Metalinguistic Abstraction I.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\Metalinguistic Abstraction I.md',
            settings: {
              fontSize: 6.3,
              startLine: 0,
              endLine: 99,
              showHeading: true,
              id: 0,
              bottomBorder: false,
            },
          },
        ],
        [
          {
            name: 'Metalinguistic Abstraction I.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\Metalinguistic Abstraction I.md',
            settings: {
              fontSize: 5,
              startLine: 99,
              endLine: 195,
              showHeading: false,
              id: 1,
              bottomBorder: true,
            },
          },
          {
            name: 'Metalinguistic Abstraction II.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\Metalinguistic Abstraction II.md',
            settings: {
              fontSize: 5.8,
              startLine: 0,
              endLine: 44, //150
              showHeading: true,
              id: 0,
              bottomBorder: false,
            },
          },
        ],
        [
          {
            name: 'Metalinguistic Abstraction II.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\Metalinguistic Abstraction II.md',
            settings: {
              fontSize: 5.5,
              startLine: 44,
              endLine: 999, //150
              showHeading: false,
              id: 1,
              bottomBorder: false,
            },
          },
        ],
      ],
    },
    {
      columns: [
        [
          {
            name: 'CSE Machine.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\CSE Machine.md',
            settings: {
              fontSize: 6.5,
              startLine: 0,
              endLine: 74, //165
              showHeading: true,
              id: 0,
              bottomBorder: false,
            },
          },
        ],
        [
          {
            name: 'CSE Machine.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\CSE Machine.md',
            settings: {
              fontSize: 6.8,
              startLine: 74,
              endLine: 140, //165
              showHeading: false,
              id: 0,
              bottomBorder: false,
            },
          },
        ],
        [
          {
            name: 'CSE Machine.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\CSE Machine.md',
            settings: {
              fontSize: 6.8,
              startLine: 140,
              endLine: 999, //165
              showHeading: false,
              id: 0,
              bottomBorder: true,
            },
          },
          {
            name: 'OOG.md',
            path: 'C:\\Users\\yonge\\Documents\\obsidian-nus\\nus\\1 - Notes\\CS1101S\\OOG.md',
            settings: {
              fontSize: 6.5,
              startLine: 0,
              endLine: 165, //165
              showHeading: true,
              id: 0,
              bottomBorder: false,
            },
          },
        ],
      ],
    },
  ],
});

watch(
  finalPages,
  (newValue) => {
    console.log(newValue);
  },
  { deep: true }
);

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
