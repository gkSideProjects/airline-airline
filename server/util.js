import cache from "memory-cache";
import { ryanairBistol, locationData, easyJetFilter } from "./data.js";

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getMultipleEasyjet(depatures, arrival) {
  if (depatures.length > 2) return;

  let data = [];

  for (let depature of depatures) {
      const result = await getEasyjetData(depature, arrival)
      await delay();
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
      await delay();
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
      console.log(flight.departureDateTime, maxDate);
      const flightDate = new Date(flight.departureDateTime);

      if (flightDate > maxDate) {
          console.log(index)
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
  const cache_size = cache.size();

  return { cache, cache_size };
}

export function getLink(data, airline) {
  let link;

  if (airline === "easyjet") {
    link = "https://www.easyjet.com/en/cheap-flights/";
  } else if (airline === "ryanair") {
    link = "https://www.ryanair.com/gb/en/cheap-flights/";
  }

  for (let flight of data) {
    const extra = `${flight.depature.city.toLowerCase()}/${flight.arrival.city.toLowerCase()}`;
    flight.link = link + extra;
  }

  return data;
}

export function getMaxDate(days) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);

  return currentDate;
}

export function sortByPriceFlights(data, direction) {
  if (direction === "ASC") {
    return data.sort((a, b) => a.outboundPrice - b.outboundPrice);
  } else if (direction === "DESC") {
    return data.sort((a, b) => b.outboundPrice - a.outboundPrice);
  }
}

/*
		{
			"flightNumber": "2803",
			"departureAirport": "BRS",
			"arrivalAirport": "ATH",
			"arrivalCountry": "GRC",
			"outboundPrice": 158.99,
			"returnPrice": 160.35,
			"departureDateTime": "2024-03-31T17:15:00",
			"arrivalDateTime": "2024-03-31T23:00:00",
			"serviceError": null
		},

		outbound: {
            departureAirport: {
                countryName: "United Kingdom",
                iataCode: "BRS",
                name: "Bristol",
                seoName: "bristol",
                city: {
                    name: "Bristol",
                    code: "BRISTOL",
                    countryCode: "gb",
                },
            },
            arrivalAirport: {
                countryName: "Spain",
                iataCode: "ACE",
                name: "Lanzarote",
                seoName: "lanzarote",
                city: {
                    name: "Lanzarote",
                    code: "LANZAROTE",
                    countryCode: "es",
                },
            },
            departureDate: "2024-02-28T15:00:00",
            arrivalDate: "2024-02-28T18:55:00",
            price: {
                value: 17.99,
                valueMainUnit: "17",
                valueFractionalUnit: "99",
                currencyCode: "GBP",
                currencySymbol: "£",
            },
            flightKey: "FR~4755~ ~~BRS~02/28/2024 15:00~ACE~02/28/2024 18:55~~",
            flightNumber: "FR4755",
            previousPrice: null,
            priceUpdated: 1708245912000,
        },
        summary: {
            price: {
                value: 17.99,
                valueMainUnit: "17",
                valueFractionalUnit: "99",
                currencyCode: "GBP",
                currencySymbol: "£",
            },
            previousPrice: null,
            newRoute: false,
        },
    },
*/
