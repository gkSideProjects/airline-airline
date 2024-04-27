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
