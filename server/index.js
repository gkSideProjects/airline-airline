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

    for (const flightCategory in req.body.cache) {
        for (const destination in req.body.cache[flightCategory]) {
            if (current_cache[flightCategory].hasOwnProperty(req.body.code) && current_cache[flightCategory][req.body.code].days >= req.body.cache[flightCategory][req.body.code].days) {
                const filtered_data = filterFlights(current_cache[flightCategory][req.body.code].data, req.body.days, true);
                let flight_data_copy = JSON.parse(JSON.stringify(filtered_data));
                res.send(sortByPriceFlights(flight_data_copy, "ASC"));
                console.log("in cache");

                return;
            }

            console.log("not in cache");

            let flight_results = await getFlightData(req.body.airlines, req.body.airports, req.body.code, req.body.days);
            let flight_results_copy = JSON.parse(JSON.stringify(flight_results));

            current_cache[flightCategory][destination] = {
                data: flight_results[flightCategory][destination].data,
                days: req.body.days
            }

            cache.put("all", current_cache);
            res.send(sortByPriceFlights(flight_results_copy[flightCategory][destination].data, "ASC"));

            return;
        }
    }
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