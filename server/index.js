import express from "express";
import fetch from "fetch";
import cors from "cors";
import { getLink } from "./util.js";
import { getMultipleAirline, getFlightData, filterFlights, transformObject, sortByPriceFlights, checkCache } from "./util.js";

const app = express();
const port = 3000;
const { cache } = checkCache();

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.post("/getData", async (req, res) => {
    const current_cache = cache.get("all");
    let return_cache = [];

    for (const flightCategory in current_cache) {
        if (!req.body.cache.hasOwnProperty(flightCategory)) continue;

        if (!current_cache[flightCategory].hasOwnProperty(req.body.code)) continue;

        if (current_cache[flightCategory][req.body.code].days < req.body.cache[flightCategory][req.body.code].days) continue;

        return_cache = [...return_cache, ...current_cache[flightCategory][req.body.code].data]

        console.log("in cache");
    }

    if (return_cache.length) {
        res.send(sortByPriceFlights(return_cache, "ASC"));

        return;
    }

    console.log("not in cache")

    let flight_data = [];
    let flight_results = await getFlightData(req.body.airlines, req.body.airports, req.body.code, req.body.days);
    let flight_results_copy = JSON.parse(JSON.stringify(flight_results));

    for (const flightCategory in flight_results_copy) {
        const existing_cache = current_cache[flightCategory];
        for (const destination in flight_results_copy[flightCategory]) {
            flight_data = [...flight_data, ...flight_results_copy[flightCategory][destination].data];

            if (!existing_cache.hasOwnProperty(destination) || existing_cache[destination].days < req.body.days) {
                existing_cache[destination] = {
                    data: flight_data,
                    days: req.body.days
                }

                cache.put(flightCategory, existing_cache);
            }
        }
    }

    res.send(sortByPriceFlights(flight_data, "ASC"));
})

app.listen(port, () => {
    cache.put("all", {
        "easyjetBRS": {},
        "easyjetNQY": {},
        "ryanairBRS": {},
        "ryanairNQY": {}
    });

    console.log(`airline-airline - listening on port ${port}`);
});