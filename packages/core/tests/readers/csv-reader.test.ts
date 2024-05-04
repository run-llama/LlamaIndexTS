import { PapaCSVReader } from "llamaindex/readers/CSVReader";
import type { AddressInfo } from "net";
import { createServer } from "node:http";
import { expect, test } from "vitest";

const csv = `title,reviewid,creationdate,criticname,originalscore,reviewstate,reviewtext
Beavers,1145982,2003-05-23,Ivan M. Lincoln,3.5/4,fresh,"Timed to be just long enough for most youngsters' brief attention spans -- and it's packed with plenty of interesting activity, both on land and under the water."
Blood Mask,1636744,2007-06-02,The Foywonder,1/5,rotten,"It doesn't matter if a movie costs 300 million or only 300 dollars; good is good and bad is bad, and Bloodmask: The Possession of Nicole Lameroux is just plain bad."`;

test("csv reader with http request", async (context) => {
  const reader = new PapaCSVReader();
  const server = createServer((req, res) => {
    expect(req.url).toBe("/test.csv");
    res.setHeader("Content-Type", "text/csv");
    res.end(csv);
  }).listen();
  context.onTestFinished(() => {
    server.close();
  });
  const port = (server.address() as AddressInfo).port;
  const url = new URL("http://localhost:" + port + "/test.csv");
  const documents = await reader.loadData(url);
  expect(documents.length).toBe(1);
  expect(documents[0].text).toMatchInlineSnapshot(`
    "title, reviewid, creationdate, criticname, originalscore, reviewstate, reviewtext
    Beavers, 1145982, 2003-05-23, Ivan M. Lincoln, 3.5/4, fresh, Timed to be just long enough for most youngsters' brief attention spans -- and it's packed with plenty of interesting activity, both on land and under the water.
    Blood Mask, 1636744, 2007-06-02, The Foywonder, 1/5, rotten, It doesn't matter if a movie costs 300 million or only 300 dollars; good is good and bad is bad, and Bloodmask: The Possession of Nicole Lameroux is just plain bad."
  `);
  expect(documents[0].hash).toMatchInlineSnapshot(
    `"HlE1SNFxtti8/Rd16ADNKv1uzLd2MIRfHeNCTuAkwDY="`,
  );
});
