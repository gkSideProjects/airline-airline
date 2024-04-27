<script setup>
import { ref } from "vue";

const isSelected = ref(false);

const props = defineProps({
  airportData: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["buttonState"]);

function clickButton() {
  isSelected.value = !isSelected.value;

  emit("buttonState", {
    key: props.airportData.key,
    value: isSelected.value,
  });
}
</script>

<template>
  <div :class="{ back: true }">
    <div
      :class="{
        airportTextWobble: !isSelected,
        airportText: true,
        airportTextPushed: isSelected,
      }"
      @click="clickButton()"
    >
      <div class="airport-text-container">
        <div>{{ airportData.name }}</div>
        <div style="font-size: 0.5rem">({{ airportData.acron }})</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.airport-text-container {
  justify-content: center;
  flex-direction: column;
  display: flex;
  width: inherit;
  height: inherit;
}
.back {
  display: block;
  border-radius: 1rem;
  background-color: lightgrey;
  border-radius: 1rem;
  width: 7rem;
  height: 4rem;
}

.airportTextPushed {
  transform: translateY(0.5px);
}

.airportTextWobble {
  transform: translateY(-8px);
}

.airportText {
  text-align: center;
  width: inherit;
  height: inherit;
  border: black solid 0.1rem;
  font-size: 1rem;
  background-color: white;
  border-radius: 1rem;
  transition: transform 250ms;
}

.back:hover .airportTextWobble {
  transform: translateY(-6px);
  cursor: pointer;
}
</style>
