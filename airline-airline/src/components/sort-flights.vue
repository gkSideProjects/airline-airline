<script setup>
import { ref, watchEffect } from "vue";
import { addSpaces } from "@/helper";

const emit = defineEmits(["passSortOption"]);

let optionSelected = ref("Price");

let sortOptions = ref({
    Price: true,
    Date: false,
    Airline: false,
    DepatureAirport: false,
    ArrivalAirport: false,
    Country: false,
});

let sortSettings = ref({
    ASC: true,
    DESC: false,
});

watchEffect(() => {
    emit("passSortOption", {
        setting: sortSettings.value.ASC ? "ASC" : "DESC",
        option: optionSelected.value,
    });
});

function filterOption(key) {
    if (optionSelected.value != key) {
        sortOptions.value[key] = true;
    }

    // Clear previous value
    if (optionSelected.value.length && optionSelected.value != key) {
        sortOptions.value[optionSelected.value] = false;
    }

    optionSelected.value = key;
}

function filterSetting(setting) {
    if (!sortSettings.value[setting]) sortSettings.value[setting] = true;

    if (setting === "ASC") {
        sortSettings.value["DESC"] = false;
    } else {
        sortSettings.value["ASC"] = false;
    }
}
</script>

<template>
  <div class="sort-container">
    <div
      v-for="(value, key) in sortOptions"
      :key="key"
      :class="{
        sortFilter: true,
        filterSelected: sortOptions[key],
      }"
      @click="filterOption(key)"
    >
      {{ addSpaces(key) }}
    </div>
  </div>
  <div class="sort-settings-container">
    <div
      :class="{
        sortFilter: true,
        filterSelected: sortSettings.ASC,
      }"
      @click="filterSetting('ASC')"
    >
      ASC
    </div>
    <div
      :class="{
        sortFilter: true,
        filterSelected: sortSettings.DESC,
      }"
      @click="filterSetting('DESC')"
    >
      DSC
    </div>
  </div>
</template>

<style>
.sort-settings-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.sort-container {
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sortFilter {
  user-select: none;
  border: solid 0.1rem lightgrey;
  cursor: pointer;
  padding: 0.1rem 0.5rem;
  border-radius: 0.5rem;
}

.filterSelected {
  background-color: rgb(228, 228, 228);
}
</style>
