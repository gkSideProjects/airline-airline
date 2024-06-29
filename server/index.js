import express from "express";
import fetch from "fetch";
import cors from "cors";
import { getLink, getEasyjetData } from "./util.js";
import { getMultipleEasyjet, getFlightData, filterFlights, transformObject, filter, sortByPriceFlights, checkCache } from "./util.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.post("/getData", async (req, res) => {
    const { cache } = checkCache();
    const current_cache = cache.get(req.body.code);

    if (current_cache && current_cache.days >= req.body.days && req.body.airlines.length <= current_cache.airline.length) {
        req.body.airlines.forEach((airline) => {
            if (!current_cache.airline.includes(airline)) return;
        })
        console.log("in cache");
        const filtered_flights = filterFlights(current_cache.data, req.body.days);

        res.send({
            airline: req.body.airlines,
            days: req.body.days,
            code: req.body.code,
            data: filtered_flights,
        });

        return;
    }

    console.log("not in cache")

    let combinedData = [];
    let easyjet_result;
    let ryanair_result;

    let flight_results = await getFlightData(req.body.airlines, req.body.airports, req.body.code, req.body.days);
    let flight_results_copy = JSON.parse(JSON.stringify(flight_results));

    const response_object = {
        airline: req.body.airlines,
        days: req.body.days,
        code: req.body.code,
        data: flight_results,
    };

    cache.put(req.body.code, response_object);

    res.send({
        airline: req.body.airlines,
        days: req.body.days,
        code: req.body.code,
        data: sortByPriceFlights(flight_results_copy, "ASC"),
    });
})

app.listen(port, () => {
    console.log(`airline-airline - listening on port ${port}`);
});