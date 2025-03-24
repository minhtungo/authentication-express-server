import fs from "node:fs";
import S3rver from "s3rver";

new S3rver({
  port: process.env.AWS_S3_PORT,
  address: "0.0.0.0",
  directory: "./s3",
  configureBuckets: [
    {
      name: "get-social",
      configs: [fs.readFileSync("./cors.xml")],
    },
  ],
}).run();
