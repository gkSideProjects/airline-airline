<script setup>
import { ref } from "vue";
import { cleanTime } from "@/helper";
import { locationData } from "../data/data";

const isSelected = ref(false);

const flight = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    position: {
        type: Number,
        default: 0,
    },
});

const airline = flight.data.airline === "ryanair" ? "/ryanair.png" : "/easyjet.png";
const flag = locationData[flight.data.arrivalAirport].country.toLowerCase() + "_flag.png";

function clickButton() {
    window.open(flight.data.link);
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
        <div class="date-image-container">
          <div class="date">
            {{ cleanTime(flight.data.departureDateTime) }}
          </div><img
            class="result-image"
            :src="airline"
          >
        </div>
        <div class="result-container">
          <div>
            <div class="result-text result-airport">
              {{ flight.data.depature.city.toUpperCase() }}
            </div>
            <div class="result-text-small">
              ({{ flight.data.departureAirport }})
            </div>
          </div>
          <img src="/arrow.svg">
          <div>
            <div class="result-text">
              {{ flight.data.arrival.city.toUpperCase() }}
            </div>
            <div class="result-text-small">
              ({{ flight.data.arrivalAirport }})
            </div>
          </div>
        </div>
        <div class="price-container">
          <div
            :class="{
              flightPrice: true,
              priceText: true,
              chepeastFlight: position === 0,
              normalFlight: position > 0,
            }"
          >
            £{{ flight.data.outboundPrice }}
          </div>
          <img
            class="flag"
            :src="flag"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date {
  background:rgb(243 243 243);
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}

.price-container, .date-image-container {
  padding: 0 1rem;
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.flag {
  width: 3rem;
  height: 1.9rem;
  border-radius: 0.2rem;
  align-self: end;
}

.result-image {
  width: 3rem;
  height: 1.7rem;
  border-radius: 0.2rem;
  align-self: center;
}

.result-airport {
  min-width: 3rem;
}

.result-text-small {
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.result-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.result-container-mini {
  font-size: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.result-container {
  font-size: 1rem;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.chepeastFlight {
  background-color: aquamarine;
}

.normalFlight {
  background-color: rgb(231, 229, 229);
}

.lastFlight {
  background-color: rgb(251, 122, 122);
}

.airport-text-container {
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: flex;
  width: inherit;
  height: inherit;
}
.flightPrice {
  width: fit-content;
  border-radius: 0.5rem;
  padding: 0.1rem 0.5rem;
}

.back {
  display: block;
  border-radius: 1rem;
  background-color: lightgrey;
  border-radius: 1rem;
  width: 20rem;
  height: 11rem;
}

.airportTextPushed {
  transform: translateY(0.5px);
}

.airportTextWobble {
  transform: translateY(-8px);
}

.airportText {
  background-color: aquamarine;
  text-align: center;
  width: inherit;
  height: inherit;
  border: lightgrey solid 0.1rem;
  font-size: 1rem;
  background-color: white;
  border-radius: 1rem;
  transition: transform 250ms;
}

.priceText {
  font-size: 1.5rem;
}

.back:hover .airportTextWobble {
  transform: translateY(-6px);
  cursor: pointer;
}
.back:active .airportTextWobble {
  transform: translateY(1.5px);
}
</style>
