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
} from "./easyjetUtil.js";

import {
  filterRyanairFlights,
  getRyanairCheapestFlight,
  getXCheapestRyanairFlights,
  getRyanairLocationData,
  filterRyanairByCountry,
  filterRyanairByAirport,
  transformObject,
} from "./ryanairUtil.js";

const app = express();
const port = 3000;

app.use(express.json());

//cors
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/getData", (req, res) => {
  const airlines = req.body.airlines;
  const airports = req.body.airports;
  const days = req.body.days ? req.body.days : 50;
  const countries = req.body.countries;
  let combinedData = [];

  if (airlines.includes("easyjet")) {
    let easyjet = filterEasyjetFlights(easyMockData, days);
    easyjet = filterEasyjetByCountry(easyjet, countries);
    easyjet = filterEasyjetByAirport(easyjet, airports);
    const xCheapest = getXCheapestEasyjetFlights(easyjet, easyjet.length);
    const result = getEasyjetLocationData(easyjet);
    combinedData.push(...getLink(result, "easyjet"));
  }

  if (airlines.includes("ryanair")) {
    let ryanair = filterRyanairFlights(ryanMockData, days);
    ryanair = filterRyanairByCountry(ryanair, countries);
    ryanair = filterRyanairByAirport(ryanair, airports);
    const xCheapest = getXCheapestRyanairFlights(ryanair, ryanair.length);
    const result = getRyanairLocationData(ryanair);
    const data = transformObject(result);
    const link = getLink(data, "ryanair");
    combinedData.push(...getLink(link, "ryanair"));
  }

  combinedData = sortByPriceFlights(combinedData, "ASC");

  res.send(combinedData);
});

app.post("/easyjet", (req, res) => {
  // const airport = req.body.airport;
  const days = req.body.days ? req.body.days : 50;
  const data = filterEasyjetFlights(mockData, days);
  const cheapest = getEasyjetCheapestFlight(data);
  const xCheapest = getXCheapestEasyjetFlights(data, data.length);
  const result = getEasyjetLocationData(xCheapest);
  const final = getLink(result, "easyjet");

  res.send(final);

  // const response = fetch(`https://www.easyjet.com/api/routepricing/v3/searchfares/GetLowestDailyFares?departureAirport=BRS&arrivalAirport=${airport}&currency=GBP`, {});
});

app.get("/ryanair", (req, res) => {
  // const airport = req.body.airport
  const days = req.body.days ? req.body.days : 50;
  const data = filterRyanairFlights(mockData, days);
  const cheapest = getRyanairCheapestFlight(data);
  const xCheapest = getXCheapestRyanairFlights(data, data.length);
  const result = getRyanairLocationData(xCheapest);
  const final = getLink(result, "ryanair");

  res.send(final);

  // const response = fetch(`https://www.ryanair.com/api/farfnd/3/oneWayFares/BRS/ALC/cheapestPerDay?ToUs=AGREED&market=en-gb&outboundMonthOfDate=2024-03-01`, {});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
