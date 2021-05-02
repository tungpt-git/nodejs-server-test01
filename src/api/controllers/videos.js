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
          excludes: ["segments"],
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
    const body = result.body;
    const data = {
      total: body.hits.total.value,
      items: body.hits.hits.map((item) => ({
        ...item._source,
        segments: item.inner_hits.segments.hits.hits.map((s) => ({
          start: s._source.start,
          end: s._source.end,
          text: s._source.text,
        })),
      })),
    };

    res.json({ body: { data } });
  } catch (error) {
    res.json({ message: error.message });
  }
}

export async function getVideo(req, res) {
  const { id: uid } = req.params;
  try {
    const client = new Client({ node: process.env.ELASTICHSEARCH });

    const result = await client.search({
      index: INDEXES.VIDEOS,
      body: {
        query: {
          match: {
            uid,
          },
        },
      },
    });

    const video = result.body.hits.hits?.length
      ? result.body.hits.hits[0]._source
      : null;
    console.log(result);
    res.json({ body: { data: video } });
  } catch (error) {
    res.json({ message: error.message });
  }
}
