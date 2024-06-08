import express from "express";
import fetch from "fetch";
import cors from "cors";
import { getLink } from "./util.js";
import { ryanMockData } from "./ryanMockData.js";
import { easyMockData } from "./easyMockData.js";
import { filterFlights, transformObject, filter, sortByPriceFlights, checkCache } from "./util.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.post("/loadData", (req, res) => {
    const { cache } = checkCache();

    if (cache.size()) {
        console.log("data already in cache")

        return;
    }

    let eastjet_result = filter(easyMockData, 100, req.body.countries, ["BRS", "NQY"]);
    let combinedData = [...getLink(eastjet_result, "easyjet")];
    let ryanair_result = filter(ryanMockData, 100, req.body.countries, ["BRS", "NQY"]);

    combinedData.push(...getLink(ryanair_result, "ryanair"));
    combinedData = sortByPriceFlights(combinedData, "ASC");
    
    cache.put("all", combinedData);
});

app.post("/getData", (req, res) => {
    const { cache } = checkCache();
    
    if (req.body.airlines.includes("easyjet")) {
        let easyjet_result = filter(easyMockData, req.body.days, req.body.countries, req.body.airports);
        let combinedData = [...getLink(easyjet_result, "easyjet")];
    }

    if (req.body.airlines.includes("easyjet")) {
        let ryanair_result = filter(ryanMockData, req.body.days, req.body.countries, req.body.airports);
    }

    combinedData.push(...getLink(ryanair_result, "ryanair"));
    combinedData = sortByPriceFlights(combinedData, "ASC");

    cache.put("all", combinedData);
    res.send(combinedData);
})

app.listen(port, () => {
    console.log(`airline-airline - listening on port ${port}`);
});
