<script setup>
import { ref } from "vue";

const days = ref(50);
const emit = defineEmits(["dayState"]);

function slide() {
  emit("dayState", days.value);
}
</script>

<template>
  <p class="slider-text">Range: {{ days }}</p>
  <input
    v-model="days"
    class="slider"
    type="range"
    step="1"
    min="1"
    max="100"
    @change="slide"
  />
</template>

<style>
.slider-text {
  min-width: 6rem;
}

.slider {
  border: 0.1rem solid lightgrey;
  border-radius: 1rem;
  -webkit-appearance: none;
  appearance: none;
  height: 1.5rem;
  width: 14.5rem;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
  background-size: cover;
  background-image: url("/plane.png");
  background-size: contain;
  background-position: left center;
  background-repeat: no-repeat;
  -webkit-appearance: none;
  appearance: none;
  width: 5rem;
  height: 10rem;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20rem;
  height: 20rem;
  background: #04aa6d;
  cursor: pointer;
}
</style>
