<script setup lang="ts">
import { Checkmark } from '@vicons/ionicons5';
const selectedStep = defineModel<number>({ required: true });
</script>

<template>
  <div class="w-full flex justify-center px-10 pt-7 text-gray-800 font-semibold">
    <div class="w-full max-w-[65rem] h-16 border border-gray-200 rounded-xl flex justify-between">
      <div
        class="flex justify-between flex-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        @click="selectedStep = 0">
        <div class="px-4 py-1 flex items-center">
          <div
            :class="[
              selectedStep === 0
                ? 'border-indigo-600 text-indigo-600'
                : selectedStep > 0
                ? 'bg-indigo-600 text-white'
                : 'border-gray-300',
              'rounded-full h-10 w-10 border flex items-center justify-center transition-colors',
            ]">
            <span class="text-xl font-normal pr-[1px]" v-if="selectedStep <= 0">1</span>
            <span class="w-6 h-6" v-else><Checkmark /></span>
          </div>
          <span class="pl-3">Select Files</span>
        </div>
        <svg
          fill="none"
          viewBox="0 0 22 80"
          preserveAspectRatio="none"
          class="text-gray-300 h-full">
          <path
            d="M0 -2L20 40L0 82"
            stroke="currentcolor"
            vector-effect="non-scaling-stroke"
            stroke-linejoin="round"></path>
        </svg>
      </div>
      <div
        class="flex justify-between flex-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        @click="selectedStep = 1">
        <div class="px-4 py-1 flex items-center">
          <div
            :class="[
              selectedStep === 1
                ? 'border-indigo-600 text-indigo-600'
                : selectedStep > 1
                ? 'bg-indigo-600 text-white'
                : 'border-gray-300',
              'rounded-full h-10 w-10 border flex items-center justify-center transition-colors',
            ]">
            <span class="text-xl font-normal pl-[1px]" v-if="selectedStep <= 1">2</span>
            <span class="w-6 h-6" v-else><Checkmark /></span>
          </div>
          <span class="pl-3">Confirm Files</span>
        </div>
        <svg
          fill="none"
          viewBox="0 0 22 80"
          preserveAspectRatio="none"
          class="text-gray-300 h-full">
          <path
            d="M0 -2L20 40L0 82"
            stroke="currentcolor"
            vector-effect="non-scaling-stroke"
            stroke-linejoin="round"></path>
        </svg>
      </div>
      <div
        class="flex justify-between flex-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        @click="selectedStep = 2">
        <div class="px-4 py-1 flex items-center">
          <div
            :class="[
              selectedStep === 2
                ? 'border-indigo-600 text-indigo-600'
                : selectedStep > 2
                ? 'bg-indigo-600 text-white'
                : 'border-gray-300',
              'rounded-full h-10 w-10 border flex items-center justify-center transition-colors',
            ]">
            <span class="text-xl font-normal pl-[1px]" v-if="selectedStep <= 2">3</span>
            <span class="w-6 h-6" v-else><Checkmark /></span>
          </div>
          <span class="pl-3">Layout</span>
        </div>
        <svg
          fill="none"
          viewBox="0 0 22 80"
          preserveAspectRatio="none"
          class="text-gray-300 h-full">
          <path
            d="M0 -2L20 40L0 82"
            stroke="currentcolor"
            vector-effect="non-scaling-stroke"
            stroke-linejoin="round"></path>
        </svg>
      </div>
      <div
        class="flex justify-between flex-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        @click="selectedStep = 3">
        <div class="px-4 py-1 flex items-center">
          <div
            :class="[
              selectedStep === 3
                ? 'border-indigo-600 text-indigo-600'
                : selectedStep > 3
                ? 'bg-indigo-600 text-white'
                : 'border-gray-400 text-gray-400',
              'rounded-full h-10 w-10 border flex items-center justify-center transition-colors',
            ]">
            <span class="text-xl font-normal pl-[1px]" v-if="selectedStep <= 3">4</span>
            <span class="w-6 h-6" v-else><Checkmark /></span>
          </div>
          <span class="pl-3">Export</span>
        </div>
      </div>
    </div>
  </div>
</template>
