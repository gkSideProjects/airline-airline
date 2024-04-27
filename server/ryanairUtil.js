import { locationData } from "./data.js";
import { getMaxDate } from "./util.js";

export function filterRyanairFlights(data, days) {
  const maxDate = getMaxDate(days);

  for (const [index, flight] of data.entries()) {
    const currentDate = new Date(flight.outbound.departureDate);

    if (currentDate > maxDate) {
      return data.slice(0, index);
    }
  }

  return data;
}

export function filterRyanairByAirport(data, airports) {
  const flights = data.filter((flight) => {
    return airports.includes(flight.outbound.departureAirport.iataCode);
  });

  return flights;
}

export function filterRyanairByCountry(data, countries) {
  const flights = data.filter((flight) => {
    return countries.includes(flight.outbound.arrivalAirport.countryName);
  });

  return flights;
}

export function getRyanairCheapestFlight(data) {
  const cheapest = data.reduce(
    (cheapest, current) =>
      cheapest.outbound.price.value > current.outbound.price.value
        ? current
        : cheapest,
    data[0]
  );

  return cheapest;
}

export function getXCheapestRyanairFlights(data, x) {
  const cheapest = data.sort(
    (a, b) => a.outbound.price.value - b.outbound.price.value
  );

  return cheapest.slice(0, x);
}

export function getRyanairLocationData(data) {
  for (let flight of data) {
    flight.depature = locationData[flight.outbound.departureAirport.iataCode];
    flight.arrival = locationData[flight.outbound.arrivalAirport.iataCode];
  }

  return data;
}

export function transformObject(flights) {
  let newFlights = [];

  flights.forEach((flight) => {
    let newObject = {
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

/*
		{
			"flightNumber": "2803",
			"arrivalAirport": "ATH",
			"departureAirport": "BRS",
			"outboundPrice": 158.99,
			"arrivalCountry": "GRC",
			"returnPrice": 160.35,
			"departureDateTime": "2024-03-31T17:15:00",
			"arrivalDateTime": "2024-03-31T23:00:00",
			"serviceError": null
		},

        {
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
                flightKey:
                    "FR~4755~ ~~BRS~02/28/2024 15:00~ACE~02/28/2024 18:55~~",
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
