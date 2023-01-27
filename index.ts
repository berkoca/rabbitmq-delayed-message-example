require("dotenv").config({ path: __dirname + "/.env" });

import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import AMQP from "./AMQP";
import { Message } from "amqplib/callback_api";

const app = express();
const port = process.env.PORT || 3000;
const amqp = new AMQP(
  process.env.AMQP_URL,
  process.env.QUEUE_NAME,
  process.env.EXCHANGE_NAME,
  process.env.ROUTING_KEY
);

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

app.post("/", (req, res) => {
  try {
    amqp.publish(JSON.stringify(req.body), req.query.delay!.toString());
    return res.send("Message added to queue");
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
});

amqp.start((message: Message) => {
  console.log("New Message - " + message.content.toString());
  console.log(message.properties.messageId)
});

app.listen(port, () => console.log(`App listening on port ${port}`));
