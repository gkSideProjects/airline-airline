import express from "express";
import fetch from "fetch";
import cors from "cors";
import { getLink } from "./util.js";
import { ryanMockData } from "./ryanMockData.js";
import { easyMockData } from "./easyMockData.js";
import { sortByPriceFlights } from "./util.js";

import {
    filterEasyjetFlights,
    getEasyjetCheapestFlight,
    getXCheapestEasyjetFlights,
    getEasyjetLocationData,
    filterEasyjetByCountry,
    filterEasyjetByAirport,
    filterEasyjet,
} from "./easyjetUtil.js";

import {
    filterRyanairFlights,
    getRyanairCheapestFlight,
    getXCheapestRyanairFlights,
    getRyanairLocationData,
    filterRyanairByCountry,
    filterRyanairByAirport,
    transformObject,
    filterRyanair,
} from "./ryanairUtil.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/allAirlines", (req, res) => {
    const airlines = req.body.airlines;
    const airports = req.body.airports;
    const days = req.body.days ? req.body.days : 50;
    const countries = req.body.countries;
    let combinedData = [];

    if (airlines.includes("easyjet")) {
        let result = filterEasyjet(easyMockData, days, countries, airports);
        combinedData.push(...getLink(result, "easyjet"));
    }

    if (airlines.includes("ryanair")) {
        let result = filterRyanair(ryanMockData, days, countries, airports);
        combinedData.push(...getLink(result, "ryanair"));
    }

    combinedData = sortByPriceFlights(combinedData, "ASC");

    res.send(combinedData);
});

app.post("/easyjet", (req, res) => {
    const days = req.body.days ? req.body.days : 50;

    let data = filterEasyjetFlights(easyMockData, days);
    data = filterEasyjetByCountry(data, req.body.countries);
    data = filterEasyjetByAirport(data, req.body.airports);
    data = getEasyjetLocationData(data);
    data = getLink(data, "easyjet");

    res.send(data);

    // const response = fetch(`https://www.easyjet.com/api/routepricing/v3/searchfares/GetLowestDailyFares?departureAirport=BRS&arrivalAirport=${airport}&currency=GBP`, {});
});

app.post("/ryanair", (req, res) => {
    const days = req.body.days ? req.body.days : 50;

    let data = filterRyanairFlights(ryanMockData, days);
    data = filterRyanairByCountry(data, req.body.countries);
    data = filterRyanairByAirport(data, req.body.airports);
    data = getRyanairLocationData(data);
    data = transformObject(data);
    data = getLink(data, "ryanair");

    res.send(data);

    // const response = fetch(`https://www.ryanair.com/api/farfnd/3/oneWayFares/BRS/ALC/cheapestPerDay?ToUs=AGREED&market=en-gb&outboundMonthOfDate=2024-03-01`, {});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
