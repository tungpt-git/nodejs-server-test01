import { Client } from "@elastic/elasticsearch";
import { INDEXES } from "../../libs/const.js";
// import dotenv from "dotenv";
// dotenv.config();

("use strict");

export async function searchVideosByQuery(req, res) {
  console.log(req.body);
  try {
    const client = new Client({ node: process.env.ELASTICHSEARCH });

    const { size = 10, query: queryString } = req.body;

    const result = await client.search({
      index: INDEXES.VIDEOS,
      body: {
        _source: {
          includes: ["name"],
        },
        query: {
          nested: {
            path: "segments",
            query: {
              match: {
                "segments.text": queryString,
              },
            },
            inner_hits: {
              size,
            },
          },
        },
      },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: error.message });
  }
}
