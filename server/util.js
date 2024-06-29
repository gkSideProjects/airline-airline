import cache from "memory-cache";
import { ryanairBistol, locationData, easyJetFilter } from "./data.js";

function delay() {
    return new Promise((resolve) => setTimeout(resolve, 250));
}

export async function getMultipleEasyjet(depatures, arrival) {
    if (depatures.length > 2) return;

    let data = [];

    for (let [index, depature] of depatures.entries()) {
        const result = await getEasyjetData(depature, arrival)
        if (index !== depatures.length - 1) await delay();
        data = [...data, ...result];
    };

    return data;
}

export async function getMultipleRyanair(depatures, arrival) {
    if (depatures.length > 2) return;

    let data = [];

    depatures.forEach(async (depature) => {
        if (!Object.values(ryanairBistol).includes(depature)) return;
        const result = await getRyanairData(depature, arrival);
        if (index !== depatures.length - 1) await delay();
        data = [...data, ...result];
    });

    return data;
}

export async function getEasyjetData(departure, arrival) {
    const easyjet_url = `https://www.easyjet.com/api/routepricing/v3/searchfares/GetLowestDailyFares?` +
        `departureAirport=${departure}&arrivalAirport=${arrival}&currency=GBP`;
    try {
        const response = await fetch(easyjet_url);

        if (response.ok) {
            const data = await response.json();
            return data;
        }

    } catch (error) {
        console.log(error.name, error.message);
    }
}

export async function getRyanairData(departure, arrival) {
    const ryanair_url = `https://www.ryanair.com/api/farfnd/3/oneWayFares?&ToUs=AGREED&arrivalAirportCategoryCode=${arrival}&
  departureAirportIataCode=${departure}&language=en&market=en-gb&outboundDepartureDateFrom=2024-06-15&outboundDepartureDateTo=2025-06-15`;

    try {
        const response = await fetch(ryanair_url);

        if (response.ok) {
            const data = await response.json();

            return data;
        }

    } catch (error) {
        console.log(error.name, error.message);
    }
}

export async function getFlightData(airlines, depatures, arrival, days) {
    let flightData = [];

    if (airlines.includes("easyjet")) {
        let easyjet_data = await getMultipleEasyjet(depatures, arrival);
        easyjet_data = filter(easyjet_data, days);
        flightData = [...getLink(easyjet_data, "easyjet")];
    }

    if (airlines.includes("ryanair")) {
        let ryanair_data = await getMultipleRyanair(depatures, arrival);
        transformObject(ryanair_data);
        ryanair_data = filter(ryanair_data, days);
        flightData = [...flightData, ...getLink(ryanair_data, "ryanair")];
    }

    return flightData;
}

export function transformObject(flights) {
    let newFlights = [];

    flights.forEach((flight) => {
        let newObject = {
            airline: "ryanair",
            arrivalAirport: flight.outbound.arrivalAirport.iataCode,
            departureAirport: flight.outbound.departureAirport.iataCode,
            outboundPrice: flight.outbound.price.value,
            arrivalCountry: flight.outbound.arrivalAirport.countryName
                .slice(0, 3)
                .toUpperCase(),
            departureDateTime: flight.outbound.departureDate,
            arrivalDateTime: flight.outbound.arrivalDate,
            depature: flight.depature,
            arrival: flight.arrival,
            flightNumber: flight.outbound.flightNumber,
        };

        newFlights.push(newObject);
    });

    return newFlights;
}

export function filter(data, days) {
    let result = filterFlights(data, days)
    // result = filterByCountry(result, countries);
    // result = filterByAirport(result, airports);
    result = getLocationData(result);

    return result;
}

export function filterFlights(data, days) {
    const maxDate = getMaxDate(days);
    for (const [index, flight] of data.entries()) {
        const flightDate = new Date(flight.departureDateTime);

        if (flightDate > maxDate) {
            return data.slice(0, index);
        }
    }

    return data;
}

export function filterByCountry(data, countries) {
    const flights = data.filter((flight) => {
        return countries.includes(easyJetFilter[flight.arrivalCountry]);
    });

    return flights;
}

export function filterByAirport(data, airports) {
    const flights = data.filter((flight) => {
        return airports.includes(flight.departureAirport);
    });

    return flights;
}

export function getLocationData(data) {
    for (let flight of data) {
        flight.depature = locationData[flight.departureAirport];
        flight.arrival = locationData[flight.arrivalAirport];
    }

    return data;
}

export function checkCache() {
    return {
        cache,
        cache_size: cache.size()
    };
}

export function getLink(data, airline) {
    const link_map = {
        easyjet: "https://www.easyjet.com/en/cheap-flights/",
        ryanair: "https://www.ryanair.com/gb/en/cheap-flights/"
    }

    for (let flight of data) {
        flight.link = link_map[airline] + `${flight.depature.city.toLowerCase()}/${flight.arrival.city.toLowerCase()}`;
    }

    return data;
}

export function getMaxDate(days) {
    currentDate.setDate(new Date().getDate() + days);

    return currentDate;
}

export function sortByPriceFlights(data, direction) {
    if (direction === "ASC") return data.sort((a, b) => a.outboundPrice - b.outboundPrice);
    else if (direction === "DESC") return data.sort((a, b) => b.outboundPrice - a.outboundPrice);
}