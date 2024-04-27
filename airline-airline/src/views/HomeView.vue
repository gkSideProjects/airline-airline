<script setup>
import { ref, watchEffect } from "vue";
import AirlineButton from "../components/airline-button.vue";
import AirportButton from "../components/airport-button.vue";
import Result from "../components/flight-result.vue";
import Slider from "../components/day-slider.vue";
import { countries } from "../data/data.js";
import { addSpaces, stringSort } from "@/helper";
import Sort from "../components/sort-flights.vue";

defineEmits(["updateState", "updateDays"]);

const API_URL = "http://localhost:3000";
const flights = ref([]);
const days = ref(50);
const clearAll = ref(false);
const selectAll = ref(true);

const buttonStates = ref({
  bristol: false,
  newquay: false,
  easyjet: false,
  ryanair: false,
});

const countryFilters = ref({
  Austria: true,
  Bulgaria: true,
  Croatia: true,
  Cyprus: true,
  CzechRepublic: true,
  Egypt: true,
  Finland: true,
  France: true,
  Germany: true,
  Greece: true,
  Iceland: true,
  Italy: true,
  Malta: true,
  Morocco: true,
  Netherlands: true,
  Poland: true,
  Portugal: true,
  Spain: true,
  Switzerland: true,
  Tunisia: true,
  Turkey: true,
  UnitedKingdom: true,
});

watchEffect(() => {
  const state = Object.values(countryFilters.value)[0];

  for (const country in countryFilters.value) {
    if (countryFilters.value[country] !== state) {
      selectAll.value = false;
      clearAll.value = false;

      return;
    }
  }

  if (state) selectAll.value = state;
  else clearAll.value = !state;
});

function getAirlines() {
  let airlines = [];

  if (buttonStates.value.easyjet) airlines.push("easyjet");
  if (buttonStates.value.ryanair) airlines.push("ryanair");

  return airlines;
}

function getAirport() {
  let airport = [];

  if (buttonStates.value.bristol) airport.push("BRS");
  if (buttonStates.value.newquay) airport.push("NQY");

  return airport;
}

function getCountries() {
  let countries = [];

  for (const country in countryFilters.value) {
    if (countryFilters.value[country]) {
      countries.push(addSpaces(country));
    }
  }

  return countries;
}

async function updateCountries() {
  if (checkStates()) {
    // Render data
    await getData();
  } else {
    // do nothing
  }
}

async function updateDays(data) {
  days.value = Number(data);
  if (checkStates()) {
    // Render data
    await getData();
  } else {
    // do nothing
  }
}

let airportData = {
  bristol: { name: "Bristol", key: "bristol", acron: "BRS" },
  newquay: { name: "Newquay", key: "newquay", acron: "NQY" },
};

let airlineData = {
  easyjet: { name: "Easyjet", key: "easyjet" },
  ryanair: { name: "Ryanair", key: "ryanair" },
};

async function getData() {
  // flights.value = [];

  const data = {
    days: days.value,
    airlines: getAirlines(),
    countries: getCountries(),
    airports: getAirport(),
  };

  const response = await fetch(`${API_URL}/getData`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const data = await response.json();

    flights.value = data;

    console.log(flights);

    // flights.value.forEach((flight) => {
    //     console.log(flight.flightNumber + flight.departureDateTime);
    // });
  } else {
    console.log("ERROR");
  }
}

async function updateState(data) {
  buttonStates.value[data.key] = data.value;
  if (checkStates()) {
    // Render data
    await getData();
  } else {
    flights.value = [];
  }
}

function checkStates() {
  const airportState = buttonStates.value.bristol || buttonStates.value.newquay;
  const airlineState = buttonStates.value.easyjet || buttonStates.value.ryanair;

  // console.log(`airport: ${airportState}, airline: ${airlineState}`);
  return airportState && airlineState;
}

function filterAll(buttonType) {
  const state = buttonType === "SELECT" ? true : false;

  selectAll.value = state;
  clearAll.value = !state;
  changeAllState(state);

  updateCountries();
}

function changeAllState(state) {
  for (const country in countryFilters.value) {
    countryFilters.value[country] = state;
  }
}
/*

  if (country === "CLEARALL") {
    clearAllSelected.value = !clearAllSelected.value;

    for (const country in countryFilters.value) {
      countryFilters.value[country] = clearAllSelected.value;
    }
  } else {
*/

function clickButton(country) {
  const oppositeValue = !countryFilters.value[country];
  countryFilters.value[country] = oppositeValue;
  updateCountries();
}

function sortData(data) {
  console.log(sortMap[data.option]);

  for (const flight of flights.value) {
    console.log(flight.departureAirport);
  }

  return stringSort(flights.value, sortMap[data.option], data.setting);
}

const sortMap = {
  Price: "outboundPrice",
  Date: "departureDateTime",
  Airline: "",
  DepatureAirport: "departureAirport",
  ArrivalAirport: "arrivalAirport",
  Country: "arrivalCountry",
};
</script>

<template>
  <main>
    <div class="filter-container">
      <div class="sub-main-container">
        <div class="sub-main">
          <div class="sub-main-title">Airlines:</div>
          <AirlineButton
            airline-image="/easyjet.png"
            :airline-data="airlineData.easyjet"
            @button-state="updateState"
          />
          <AirlineButton
            airline-image="/ryanair.png"
            :airline-data="airlineData.ryanair"
            @button-state="updateState"
          />
        </div>
        <div class="sub-main">
          <div class="sub-main-title">Airport:</div>
          <AirportButton
            :airport-data="airportData.bristol"
            @button-state="updateState"
          />
          <AirportButton
            :airport-data="airportData.newquay"
            @button-state="updateState"
          />
        </div>
        <div class="sub-main">
          <slider @day-state="updateDays" />
        </div>
      </div>
      <div class="location-main-container">
        <div class="all-container">
          <div
            :class="{
              countryFilter: true,
              countrySelected: selectAll,
            }"
            @click="filterAll('SELECT')"
          >
            SELECT ALL
          </div>
          <div
            :class="{
              countryFilter: true,
              countrySelected: clearAll,
            }"
            @click="filterAll('CLEAR')"
          >
            CLEAR ALL
          </div>
        </div>
        <div class="country-main-container">
          <div
            v-for="(location, index) in countries"
            :key="location"
            :ref="location"
            :class="{
              countryFilter: true,
              countrySelected: countryFilters[location],
            }"
            :position="index"
            @click="clickButton(location)"
          >
            {{ addSpaces(location) }}
          </div>
        </div>
      </div>
      <div class="sort-main-container">
        <Sort @pass-sort-option="sortData"></Sort>
      </div>
    </div>
    <div class="sub-main results">
      <transition-group name="list">
        <Result
          v-for="(result, index) in flights"
          :key="result.flightNumber + result.departureDateTime"
          :position="index"
          :data="result"
        />
      </transition-group>
    </div>
  </main>
</template>

<style>
.all-container {
  display: flex;
  gap: 0.5rem;
}

.sort-main-container {
  width: 25rem;
  justify-content: center;
  padding: 1rem;
  gap: 2rem;
  display: flex;
  flex-direction: column;
  border: lightgrey 0.1rem solid;
  border-radius: 1rem;
  min-width: 22rem;
}

.countrySelected {
  background-color: rgb(228, 228, 228);
}

.countryFilter {
  user-select: none;
  border: solid 0.1rem lightgrey;
  cursor: pointer;
  padding: 0.1rem 0.5rem;
  border-radius: 0.5rem;
}

.country-main-container {
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}

.location-main-container {
  width: 25rem;
  justify-content: center;
  min-width: 25rem;
  align-items: center;
  padding: 1rem;
  gap: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  border: lightgrey 0.1rem solid;
  border-radius: 1rem;
}

.filter-container {
  padding: 0 1rem;
  justify-content: center;
  width: 29em;
  display: flex;
  gap: 2rem;
  flex-direction: column;
}

.results {
  justify-content: center;
}

.sub-main-title {
  min-width: 5rem;
}

.sub-main-container {
  width: 25rem;
  padding: 1.5rem 1rem;
  gap: 1.5rem;
  display: flex;
  flex-direction: column;
  border: lightgrey 0.1rem solid;
  border-radius: 1rem;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

main {
  align-items: flex-start;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 1em auto;
}

.sub-main {
  flex-wrap: wrap;
  align-items: center;
  display: flex;
  gap: 1rem;
}
</style>
