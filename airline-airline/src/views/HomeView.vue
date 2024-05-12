<script setup>
import { onMounted, ref, watchEffect } from "vue";
import AirlineButton from "../components/airline-button.vue";
import AirportButton from "../components/airport-button.vue";
import Result from "../components/flight-result.vue";
import Slider from "../components/day-slider.vue";
import { airlineData, airportData, countries } from "../data/data.js";
import { addSpaces, stringSort } from "@/helper";
import Sort from "../components/sort-flights.vue";

defineEmits(["updateAirline", "updateAirport", "updateDays"]);

const API_URL = "http://localhost:3000";
const flights = ref([]);
const airline = ref("");
const airport = ref("");
const days = ref(50);
const clearAll = ref(false);
const selectAll = ref(true);
const currentPage = ref(0);
const pageCount = ref(0);
const RESULT_COUNT = 16;


const airlineStates = ref({
    easyjet: false,
    ryanair: false,
});

const airportStates = ref({
    bristol: false,
    newquay: false,
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
        await getData();
    } else {
        // TODO: add notices
    }
}

async function updateDays(data) {
    days.value = Number(data);
    if (checkStates()) {
        await getData();
    } else {
        // TODO: add notices
    }
}

async function getData() {
    const data = {
        days: days.value,
        airlines: getAirlines(),
        countries: getCountries(),
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
    if (data.airlines.length === 2)
        return await fetch(`${API_URL}/allAirlines`, request);
    else if (data.airlines.includes("easyjet"))
        return await fetch(`${API_URL}/easyjet`, request);
    else if (data.airlines.includes("ryanair")) {
        return await fetch(`${API_URL}/ryanair`, request);
    } 
    
    return {};
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

async function updateAirportState(data) {
    airportStates.value[data.key] = data.value;
    airport.value = data.value;

    await checks();
}

function checkStates() {
    const airportState =
        airportStates.value.bristol || airportStates.value.newquay;
    const airlineState =
        airlineStates.value.easyjet || airlineStates.value.ryanair;

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

function clickButton(country) {
    const oppositeValue = !countryFilters.value[country];
    countryFilters.value[country] = oppositeValue;
    updateCountries();
}

function sortData(data) {
    const sortedData = stringSort(flights.value, sortMap[data.option], data.setting);

    return;
}

function paginate(resultCount) {
    const pagedData = [];

    for (let i = 0; i < flights.value.length; i += resultCount) {
        pagedData.push(flights.value.slice(i, i + resultCount));
    }

    pageCount.value = pagedData.length > 0 ? pagedData.length - 1 : 0;

    return pagedData;
}

const sortMap = {
    Price: "outboundPrice",
    Date: "departureDateTime",
    Airline: "",
    DepatureAirport: "departureAirport",
    ArrivalAirport: "arrivalAirport",
    Country: "arrivalCountry",
};

onMounted(() => {
    console.log(pageCount.value);
});
</script>

<template>
  <main>
    <div class="filter-container">
      <div class="sub-main-container">
        <div class="sub-main">
          <div class="sub-main-title">
            Airlines:
          </div>
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
          <div class="sub-main-title">
            Airport:
          </div>
          <AirportButton
            :airport-data="airportData.bristol"
            @button-state="updateAirportState"
          />
          <AirportButton
            :airport-data="airportData.newquay"
            @button-state="updateAirportState"
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
        <button>Page: {{ currentPage + 1 }}</button>
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
    border: 0.1rem grey solid;
    width: 10rem;
    font-size: 1rem;
}

.pageNav button:first-child:hover {
    background: lightgrey;
}

.pageNav button:last-child:hover {
    background: lightgrey;
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
    display: flex;
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

.list-move {
    transition: all 0.4s ease;
}

.list-enter-active,
.list-leave-active /* apply transition to moving elements */{
    transition: all 1s ease;
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
    flex-wrap: wrap;
    align-items: center;
    display: flex;
    gap: 1rem;
}
</style>
