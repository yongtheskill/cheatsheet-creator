<script setup lang="ts">
import { readTextFile } from '@tauri-apps/api/fs';
import { computed, ref, watch } from 'vue';
import { AddCircle, RemoveCircle, Settings, Remove } from '@vicons/ionicons5';
import markdownit from 'markdown-it';
import markdownItKatex from '@vscode/markdown-it-katex';
import markdownItFrontMatter from 'markdown-it-front-matter';
import markdownItHighlight from 'markdown-it-highlightjs';
import { DisplayFileSettings } from '../types';

const { path, baseSize, fontCorrection } = defineProps<{
  name: string;
  path: string;
  editing: boolean;
  baseSize: number;
  fontCorrection?: number;
  duplicate?: () => void;
}>();

const settings = defineModel<DisplayFileSettings>({ required: true });

const baseFontSize = computed(() => (baseSize / 1000) * (fontCorrection ?? 1));

const mdHtml = ref<string | null>(null);

const showSettings = ref(true);

let mdStr = '';
const lineN = ref(0);

function renderMd() {
  const md = markdownit({
    html: true,
    linkify: false,
    typographer: true,
  });

  md.use(markdownItKatex, { output: 'html' });
  md.use(markdownItFrontMatter, () => {});
  md.use(markdownItHighlight, {});

  const separateLines = mdStr.split(/\r?\n|\r|\n/g);
  lineN.value = separateLines.length;
  if (settings.value.startLine <= settings.value.endLine) {
    mdStr = separateLines.slice(settings.value.startLine, settings.value.endLine + 1).join('\n');
  }
  if (settings.value.endLine < 0) {
    settings.value.endLine = separateLines.length;
  }

  mdHtml.value = md.render(mdStr);
}

watch(
  () => settings,
  () => {
    renderMd();
  },
  { deep: true }
);

const fontSize = computed(() => settings.value.fontSize);

readTextFile(path).then((t) => {
  mdStr = t;
  renderMd();
});
</script>

<template>
  <div v-if="mdHtml != null" class="relative">
    <div>
      <h1
        class="font-black"
        :style="{ fontSize: `${baseFontSize * fontSize * 2.2}px` }"
        v-if="settings.showHeading">
        {{ name.replace(/\.md$/g, '') }}
      </h1>
      <div
        v-html="mdHtml"
        class="markdown-body"
        :style="{ fontSize: `${baseFontSize * fontSize}px` }"></div>
      <div
        class="flex flex-col items-end absolute top-0 right-0 bg-gray-200 px-2 py-1 rounded-lg cursor-default"
        v-if="editing">
        <button
          :class="[
            showSettings
              ? 'text-gray-800 hover:text-gray-700'
              : 'text-gray-500 hover:text-gray-400',
            'w-5 h-5',
          ]"
          @click="showSettings = !showSettings">
          <Settings v-if="!showSettings" />
          <Remove v-else />
        </button>
        <div v-if="showSettings" class="flex flex-col items-end">
          <div class="flex items-center">
            <div class="pr-2">{{ fontSize }}px</div>
            <button
              :class="[
                fontSize <= 0.1
                  ? 'text-gray-300 cursor-default'
                  : 'text-indigo-600 hover:text-indigo-500',
                ' w-6 h-6',
              ]"
              @click="
                fontSize > 0.1
                  ? (settings.fontSize = Math.round((settings.fontSize - 0.1) * 10) / 10)
                  : null
              ">
              <RemoveCircle />
            </button>
            <button
              class="text-indigo-600 hover:text-indigo-500 w-6 h-6"
              @click="settings.fontSize = Math.round((settings.fontSize + 0.1) * 10) / 10">
              <AddCircle />
            </button>
          </div>
          <div class="flex items-center">
            <div class="pr-2">S: {{ settings.startLine + 1 }}</div>
            <button
              :class="[
                settings.startLine <= 0
                  ? 'text-gray-300 cursor-default'
                  : 'text-indigo-600 hover:text-indigo-500',
                ' w-6 h-6',
              ]"
              @click="settings.startLine <= 0 ? null : (settings.startLine -= 1)">
              <RemoveCircle />
            </button>
            <button
              class="text-indigo-600 hover:text-indigo-500 w-6 h-6"
              @click="settings.startLine += 1">
              <AddCircle />
            </button>
          </div>
          <div class="flex items-center">
            <div class="pr-2">E: {{ settings.endLine < 0 ? '-' : settings.endLine + 1 }}</div>
            <button
              :class="[
                settings.endLine <= settings.startLine
                  ? 'text-gray-300 cursor-default'
                  : 'text-indigo-600 hover:text-indigo-500',
                ' w-6 h-6',
              ]"
              @click="settings.endLine <= settings.startLine ? null : (settings.endLine -= 1)">
              <RemoveCircle />
            </button>
            <button
              :class="[
                settings.endLine >= lineN
                  ? 'text-gray-300 cursor-default'
                  : 'text-indigo-600 hover:text-indigo-500',
                ' w-6 h-6',
              ]"
              @click="settings.endLine >= lineN ? null : (settings.endLine += 1)">
              <AddCircle />
            </button>
          </div>
          <div>
            <label class="inline-flex items-center cursor-pointer pr-[2px]">
              <input type="checkbox" class="sr-only peer" v-model="settings.showHeading" />
              <span class="me-2 font-medium text-gray-600">Head.</span>
              <div
                class="relative w-11 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-[145%] rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            class="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2 my-1"
            @click="duplicate">
            Duplicate
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-gray-500 text-center">Loading...</div>
</template>
