import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import { INDEXES } from "../src/libs/const.js";
dotenv.config();

console.log({ node: process.env.ELASTICHSEARCH });
const client = new Client({ node: process.env.ELASTICHSEARCH });

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
            "segments.text": "mr a",
          },
        },
        inner_hits: {
          size: 10,
        },
      },
    },
  },
});

console.log(JSON.stringify(result.body));

export async function searchVideos(queryString) {
  return await client.search({
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
            size: 10,
          },
        },
      },
    },
  });
}
