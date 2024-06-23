<script setup>
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import AirportButton from "../components/airport-button.vue";
import AirlineButton from "../components/airline-button.vue";
import Result from "../components/flight-result.vue";
import Slider from "../components/day-slider.vue";
import { airlineData, airportData, countries, cities, cityToCode } from "../data/data.js";
import { addSpaces, stringSort } from "@/helper";
import Sort from "../components/sort-flights.vue";

defineEmits(["updateAirline", "updateAirport", "updateDays"]);

const API_URL = "http://localhost:3000";
const RESULT_COUNT = 16;

const flights = ref([]);
const airline = ref("");
const days = ref(50);
const clearAll = ref(false);
const currentPage = ref(0);
const pageCount = ref(0);
const currentCity = ref("");

const airlineCount = computed(() => {
    return Object.values(airlineStates.value).reduce((count, value) => count + (value ? 1 : 0), 0);
});

const airportCount = computed(() => {
    return Object.values(airportStates.value).reduce((count, value) => count + (value ? 1 : 0), 0);
});

const cityCount = computed(() => {
    return Object.values(cityStates.value).reduce((count, value) => count + (value ? 1 : 0), 0);
});

const currentRequest = ref({
    airlines: [],
    airports: [],
    cities: []
});

const airlineStates = ref({
    easyjet: false,
    ryanair: false,
});

const airportStates = ref({
    bristol: true,
    newquay: true,
});

const cityStates = ref({
    Athens: false,
    Corfu: false,
    Chania: false,
    Heraklion: false,
    Sitia: false,
    Kefalonia: false,
    Kos: false,
    Mykonos: false,
    Preveza: false,
    Rhodes: false,
    Santorini: false,
    Skiathos: false,
    Zakynthos: false,
});


watch(airlineCount, (newValue, oldValue) => {
    if (newValue < oldValue) {
        console.log("airline removed");
    } else {
        console.log("airline added");
        checks();
    }
}, {
    deep: true
});

watch(airportCount, (newValue, oldValue) => {
    if (newValue < oldValue) {
        console.log("airport removed");
    } else {
        console.log("airport added");
        checks();
    }
}, {
    deep: true
});

watch(cityCount, (newValue, oldValue) => {
    if (newValue < oldValue) {
        console.log("city removed");
    } else {
        console.log("city added");
        checks();
    }
}, {
    deep: true
});

function getAirlines() {
    let airlines = [];

    for (const airline in airlineStates.value) {
        if (airlineStates.value[airline]) airlines.push(airline);
    }

    return airlines;
}

function getAirport() {
    let airports = [];

    for (const airport in airportStates.value) {
        if (airportStates.value[airport]) {
            airports.push(airportData[airport].acron);
        }
    }

    return airports;
}

function getCities() {
    let cities = [];

    for (const city in cityStates.value) {
        if (cityStates.value[city]) {
            cities.push(addSpaces(city));
        }
    }

    return cities;
}

async function updateCities() {
    if (checkStates()) {
        await getData();
    } else {
        flights.value = [];
    }
}

async function updateDays(data) {
    days.value = Number(data);
    if (checkStates()) {
        await getData();
    } else {
        flights.value = [];
    }
}

async function getData() {
    const data = {
        days: days.value,
        airlines: getAirlines(),
        code: cityToCode[currentCity.value].code,
        airports: getAirport(),
    };

    const request = {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const response = await callApi(data, request);

    if (response.ok) {
        const data = await response.json();
        flights.value = data;
    } else {
        console.log(response);
        console.log("ERROR");
    }
}

async function callApi(data, request) {
    return await fetch(`${API_URL}/getData`, request);
}

async function checks() {
    if (checkStates()) {
        await getData();
    } else {
        flights.value = [];
    }
}

async function updateAirlineState(data) {
    airlineStates.value[data.key] = data.value;
    airline.value = data.value;


    await checks();
}

async function updateAirportState() {
    await checks();
}

function checkStates() {
    const airportState =
        airportStates.value.bristol || airportStates.value.newquay;
    const airlineState =
        airlineStates.value.easyjet || airlineStates.value.ryanair;
    const cityState = getCities();

    return airportStates.value.bristol && airlineState && cityState.length;
}

function filterAll(buttonType) {
    const state = buttonType === "SELECT" ? true : false;

    clearAll.value = !state;
    changeAllState(state);
    updateCities();
}

function changeAllState(state) {
    for (const city in cityStates.value) {
        cityStates.value[city] = state;
    }
}

function clickButton(city) {
    currentCity.value = city;
    const oppositeValue = !cityStates.value[city];
    cityStates.value[city] = oppositeValue;
    updateCities();
}

function clickAirportButton(airport) {
    const oppositeValue = !airportStates.value[airport];
    airportStates.value[airport] = oppositeValue;
    updateAirportState();
}

function sortData(data) {
    const sortedData = stringSort(flights.value.data, sortMap[data.option], data.setting);

    return;
}

function paginate(resultCount) {
    const pagedData = [];   

    for (let i = 0; i < flights.value?.data?.length; i += resultCount) {
        pagedData.push(flights.value.data.slice(i, i + resultCount));
    }

    pageCount.value = pagedData.length > 0 ? pagedData.length - 1 : 0;

    if (currentPage.value + 1 > pageCount.value) currentPage.value = pageCount.value;

    return pagedData;
}

const sortMap = {
    Price: "outboundPrice",
    Date: "departureDateTime",
    Airline: "",
    DepatureAirport: "departureAirport",
    ArrivalAirport: "arrivalAirport",
    City: "arrivalCity",
};
</script>

<template>
  <main>
    <div class="filter-container">
      <div class="sub-main-container">
        <div class="sub-main">
          <AirlineButton
            airline-image="/easyjet.png"
            :airline-data="airlineData.easyjet"
            @button-state="updateAirlineState"
          />
          <AirlineButton
            airline-image="/ryanair.png"
            :airline-data="airlineData.ryanair"
            @button-state="updateAirlineState"
          />
        </div>
        <div class="sub-main">
          <slider @day-state="updateDays" />
        </div>
      </div>
      <div class="airport-main-container">
        <div
          :class="{
            airportFilter: true,
            airportSelected: airportStates.bristol,
          }"
          @click="clickAirportButton('bristol')"
        >
          Bristol
        </div>
        <div
          :class="{
            airportFilter: true,
            airportSelected: airportStates.newquay,
          }"
          @click="clickAirportButton('newquay')"
        >
          Newquay
        </div>
      </div>
      <div class="location-main-container">
        <div class="all-container">
          <div
            :class="{
              cityFilter: true,
              citySelected: clearAll,
            }"
            @click="filterAll('CLEAR')"
          >
            CLEAR ALL
          </div>
        </div>
        <div class="city-main-container">
          <div
            v-for="(location, index) in cities"
            :key="location"
            :ref="location"
            :class="{
              cityFilter: true,
              citySelected: cityStates[location],
            }"
            :position="index"
            @click="clickButton(location)"
          >
            {{ addSpaces(location) }}
          </div>
        </div>
      </div>
      <div class="sort-main-container">
        <Sort @pass-sort-option="sortData" />
      </div>
    </div>
    <div class="results-container">
      <div class="sub-main results">
        <transition-group name="list">
          <Result
            v-for="(result, index) in paginate(RESULT_COUNT)[currentPage]"
            :key="result.flightNumber + result.departureDateTime"
            :position="index"
            :data="result"
          />
        </transition-group>
      </div>
      <div :class="{pageNav: true, hidePageNav: pageCount === 0}">
        <button @click="currentPage > 0 ? currentPage -= 1 : currentPage = 0">
          Previous
        </button>
        <button>Page: {{ currentPage + 1 }} / {{ pageCount + 1 }}</button>
        <button @click="currentPage < pageCount ? currentPage += 1: currentPage = pageCount">
          Next
        </button>
      </div>
    </div>
  </main>
</template>

<style>
.pageNav button {
    padding: 1.5rem;
    font-family: "Raleway";
    border: 0.1rem lightgrey solid;
    width: 10rem;
    font-size: 1rem;
    background-color: white;
}

.pageNav button:first-child:hover {
    background: rgb(232, 232, 232);
}

.pageNav button:last-child:hover {
    background: rgb(232, 232, 232);
}

.pageNav button:first-child {
    border-radius: 1rem 0 0 1rem;
    border-right: none;
}

.pageNav button:last-child {
    border-radius: 0 1rem 1rem 0;
    border-left: none;
}

.pageNav {
    display: flex;
    margin: 2rem;
}

.results-container {
    justify-content: space-between;
    min-height: 56rem;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: center;
}

.hidePageNav {
    display: none;
}

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

.airportSelected, .citySelected {
    background-color: rgb(228, 228, 228);
}

.airportFilter, .cityFilter {
    user-select: none;
    border: solid 0.1rem lightgrey;
    cursor: pointer;
    padding: 0.1rem 0.5rem;
    border-radius: 0.5rem;
}

.city-main-container {
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
}

.airport-main-container, .location-main-container {
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
    display: flex;
    gap: 2rem;
    flex-direction: column;
}

.results-container .results {
    align-items: start;
    justify-content: center;
}

.sub-main-title {
    min-width: 5rem;
}

.sub-main-container {
    align-items: center;
    width: 25rem;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
    display: flex;
    flex-direction: column;
    border: lightgrey 0.1rem solid;
    border-radius: 1rem;
}

.list-move {
    transition: all 0.4s ease;
}

.list-enter-active,
.list-leave-active /* apply transition to moving elements */{
    transition: all 0.4s ease;
}

.list-leave-to {
    opacity: 0;
}

.list-leave-from {
    opacity: 0;
}

.list-enter-from {
    opacity: 0;
}

.list-enter-to {
    opacity: 100%;
}

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
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    display: flex;
    gap: 1rem;
}
</style>
