import { Client } from "@elastic/elasticsearch";
import { INDEXES } from "../../libs/const.js";
// import dotenv from "dotenv";
// dotenv.config();

("use strict");

const SEGMENTS_TEXT = `${"segments.text"}`;

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
        size,
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

    const data = formatESResult(result);

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

export async function searchVideoMultipleConditions(req, res) {
  console.log("complex", req.body);
  try {
    const client = new Client({ node: process.env.ELASTICHSEARCH });

    const { size = 10, match, notMatch, filter } = req.body;
    const { durationRange } = filter || {};

    const mustArr = (match || []).map((txt) => ({
      match: {
        "segments.text": txt,
      },
    }));

    const mustNotArr = (notMatch || []).map((txt) => ({
      match: {
        "segments.text": txt,
      },
    }));

    console.log(JSON.stringify({ mustArr }));

    const query = {
      bool: {
        filter: [
          !durationRange || !durationRange[0] || !durationRange[1]
            ? null
            : {
                range: {
                  duration: {
                    gte: durationRange[0],
                    lte: durationRange[1],
                  },
                },
              },
          {
            nested: {
              path: "segments",
              query: {
                bool: {
                  must: mustArr,
                  must_not: mustNotArr,
                },
              },
              inner_hits: {
                size: 10,
              },
            },
          },
        ].filter((i) => i !== null),
      },
    };

    console.log(JSON.stringify(query));

    const result = await client.search({
      index: INDEXES.VIDEOS,
      body: {
        _source: {
          excludes: ["segments"],
        },
        size,
        query,
      },
    });

    console.log("result", result);

    const data = formatESResult(result);

    res.json({ body: { data } });
  } catch (error) {
    console.log(JSON.stringify(error));
    res.json({ message: error.message });
  }
}

const formatESResult = (result) => {
  const body = result.body;
  return {
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
};
