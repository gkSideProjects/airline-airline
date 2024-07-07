import cache from "memory-cache";
import { ryanairBistol, locationData, easyJetFilter } from "./data.js";

function delay() {
    return new Promise((resolve) => setTimeout(resolve, 150));
}

export async function getMultipleAirline(airlines, depatures, arrival) {
    if (depatures.length > 2) return;

    let result = {
        "easyjetBRS": {},
        "easyjetNQY": {},
        "ryanairBRS": {},
        "ryanairNQY": {},
    };

    for (let [index, depature] of depatures.entries()) {
        const response = await getAirlineData(airlines, depature, arrival);

        Object.keys(result).forEach((category) => {
            if (!Object.keys(result[category]).length) result[category] = response[category];
            else if (!result[category].hasProperty(arrival)) result[category][arrival] = response[category][arrival];
            else result[category][arrival].data = [...result[category][arrival].data, ...response[category][arrival].data]
        });

        if (index !== depatures.length - 1) await delay();
    }

    return result;
}

export async function getAirlineData(airlines, departure, arrival) {
    let result = {
        "easyjetBRS": {},
        "easyjetNQY": {},
        "ryanairBRS": {},
        "ryanairNQY": {},
    };

    const easyjet_url = `https://www.easyjet.com/api/routepricing/v3/searchfares/GetLowestDailyFares?` +
        `departureAirport=${departure}&arrivalAirport=${arrival}&currency=GBP`;

    const ryanair_url = `https://www.ryanair.com/api/farfnd/3/oneWayFares?&ToUs=AGREED&arrivalAirportCategoryCode=${arrival}&
  departureAirportIataCode=${departure}&language=en&market=en-gb&outboundDepartureDateFrom=2024-06-15&outboundDepartureDateTo=2025-06-15`;

    try {
        let easy_jet_results = [];
        let ryanair_results = [];

        if (airlines.includes("easyjet")) {
            easy_jet_results = await (await fetch(easyjet_url)).json();
            easy_jet_results.forEach((flight) => flight.airline = "easyjet");

            result["easyjet" + departure][arrival] =
            {
                data: easy_jet_results
            }

        }

        if (airlines.includes("ryanair") && Object.values(ryanairBistol).includes(departure)) {
            ryanair_results = await (await fetch(ryanair_url)).json();
            ryanair_results = transformObject(ryanair_results);
            result["ryanair" + departure][arrival] =
            {
                data: easy_jet_results
            }
        }

        return result;
    } catch (error) {
        console.log(error.name, error.message);
    }
}

export async function getFlightData(airlines, depatures, arrival, days) {
    let flightData = [];
    let flight_data = await getMultipleAirline(airlines, depatures, arrival);

    flight_data = filterFlights(flight_data, days);
    flight_data = getLocationData(flight_data);
    flight_data = getLink(flight_data);

    return flight_data;
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

export function filterFlights(data, days) {
    const maxDate = getMaxDate(days);

    for (const flightCategory in data) {
        for (const destination in data[flightCategory]) {
            for (const [index, flight] of Object.entries(data[flightCategory][destination].data)) {
                const flightDate = new Date(flight.departureDateTime);

                if (flightDate > maxDate) {
                    data[flightCategory][destination].data = data[flightCategory][destination].data.slice(0, index);

                    break;
                }
            }
        }
    }

    // for (const [index, flight] of data.entries()) {
    //     const flightDate = new Date(flight.departureDateTime);

    //     if (flightDate > maxDate) {
    //         return data.slice(0, index);
    //     }
    // }

    return data;
}

export function filterByCountry(data, countries) {
    const flights = data.filterFlights((flight) => {
        return countries.includes(easyJetFilter[flight.arrivalCountry]);
    });

    return flights;
}

export function filterByAirport(data, airports) {
    const flights = data.filterFlights((flight) => {
        return airports.includes(flight.departureAirport);
    });

    return flights;
}

export function getLocationData(data) {
    for (const flightCategory in data) {
        for (const arrival in data[flightCategory]) {
            for (const flight of data[flightCategory][arrival].data) {
                flight.depature = locationData[flight.departureAirport];
                flight.arrival = locationData[flight.arrivalAirport];
            }
        }
    }

    return data;
}

export function checkCache() {
    return {
        cache
    };
}

export function getLink(data) {
    const link_map = {
        easyjet: "https://www.easyjet.com/en/cheap-flights/",
        ryanair: "https://www.ryanair.com/gb/en/cheap-flights/"
    }

    for (const flightCategory in data) {
        for (const destination in data[flightCategory]) {
            for (const flight of data[flightCategory][destination].data) {
                flight.link = link_map[flight.airline] + `${flight.depature.city.toLowerCase()}/${flight.arrival.city.toLowerCase()}`;
            }
        }
    }

    return data;
}

export function getMaxDate(days) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);

    return currentDate;
}

export function sortByPriceFlights(data, direction) {
    if (direction === "ASC") data.sort((a, b) => a.outboundPrice - b.outboundPrice);
    else if (direction === "DESC") data.sort((a, b) => b.outboundPrice - a.outboundPrice);

    return data;
}