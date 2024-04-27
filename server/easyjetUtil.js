import { locationData, easyJetFilter } from "./data.js";
import { getMaxDate } from "./util.js";

export function filterEasyjetFlights(data, days) {
  const maxDate = getMaxDate(days);

  for (const [index, flight] of data.entries()) {
    const flightDate = new Date(flight.departureDateTime);

    if (flightDate > maxDate) {
      return data.slice(0, index);
    }
  }

  return data;
}

export function filterEasyjetByAirport(data, airports) {
  const flights = data.filter((flight) => {
    return airports.includes(flight.departureAirport);
  });

  return flights;
}

export function filterEasyjetByCountry(data, countries) {
  const flights = data.filter((flight) => {
    return countries.includes(easyJetFilter[flight.arrivalCountry]);
  });

  return flights;
}

export function getEasyjetCheapestFlight(data) {
  const cheapest = data.reduce(
    (cheapest, current) =>
      cheapest.outboundPrice > current.outboundPrice ? current : cheapest,
    data[0]
  );

  return cheapest;
}

export function getXCheapestEasyjetFlights(data, x) {
  const cheapest = data.sort((a, b) => a.outboundPrice - b.outboundPrice);

  return cheapest.slice(0, x);
}

export function getEasyjetLocationData(data) {
  for (let flight of data) {
    flight.depature = locationData[flight.departureAirport];
    flight.arrival = locationData[flight.arrivalAirport];
  }

  return data;
}
