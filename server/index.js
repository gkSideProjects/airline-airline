import express from "express";
import fetch from "fetch";
import cors from "cors";
import { getLink, getEasyjetData } from "./util.js";
import { ryanMockData } from "./ryanMockData.js";
import { easyMockData } from "./easyMockData.js";
import { getFlightData, filterFlights, transformObject, filter, sortByPriceFlights, checkCache } from "./util.js";

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

    if (current_cache && current_cache.days >= req.body.days) {
        console.log("in cache");
        res.send(current_cache);

        return;
    }

    console.log("not in cache")

    let combinedData = [];
    let easyjet_result;
    let ryanair_result;
    
    let flight_results = await getFlightData(req.body.airlines, "BRS", req.body.code, req.body.days);
    flight_results = sortByPriceFlights(flight_results, "ASC");

    const response_object = {
        airline: req.body.airlines,
        days: req.body.days,
        code: req.body.code,
        data: flight_results,
    };

    cache.put(req.body.code, response_object);
    res.send(response_object);
})

app.listen(port, () => {
    console.log(`airline-airline - listening on port ${port}`);
});