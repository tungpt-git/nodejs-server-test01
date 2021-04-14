import { Client } from "@elastic/elasticsearch";
import { Indexes } from "./const.js";
import dotenv from "dotenv";
dotenv.config();

console.log({ node: process.env.ELASTICHSEARCH });
const client = new Client({ node: process.env.ELASTICHSEARCH });

const result = await client.search({
  index: Indexes.VIDEOS,
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
    index: Indexes.VIDEOS,
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
