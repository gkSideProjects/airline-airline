<script setup>
import { ref } from "vue";

const isSelected = ref(false);

const props = defineProps({
  airlineImage: String,
  pressed: Boolean,
  airlineData: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["buttonState"]);

function clickButton() {
  isSelected.value = !isSelected.value;

  emit("buttonState", {
    key: props.airlineData.key,
    value: isSelected.value,
  });
}
</script>

<template>
  <div :class="{ back: true }">
    <img
      draggable="false"
      :class="{
        airlineTextWobble: !isSelected,
        airlineText: true,
        airlineTextPushed: isSelected,
      }"
      :src="airlineImage"
      @click="clickButton"
    />
  </div>
</template>

<style scoped>
.back {
  display: block;
  border-radius: 1rem;
  background-color: lightgrey;
  border-radius: 1rem;
  width: 7rem;
  height: 4rem;
}

.airlineTextPushed {
  transform: translateY(0.5px);
}

.airlineTextWobble {
  transform: translateY(-8px);
}

.airlineText {
  border: black solid 0.1rem;
  width: inherit;
  border-radius: 1rem;
  transition: transform 250ms;
}

.back:hover .airlineTextWobble {
  transform: translateY(-6px);
  cursor: pointer;
}
</style>
