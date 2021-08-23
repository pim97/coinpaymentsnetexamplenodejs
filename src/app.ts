import { completePayment, getProduct } from "./database/sequelize";
import { create } from "./init";
import { ipn } from "./ipn";

require("dotenv").config();

const express = require("express");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/create", async (req, res) => {
  if (!req.body.product_id) {
    return res.send("Could not find product");
  }
  if (!req.body.code) {
    return res.send("Could not find code");
  }
  if (!req.body.user_id) {
    return res.send("Could not find user id");
  }
  if (!req.body.email) {
    return res.send("Could not find email");
  }
  if (!req.body.coin) {
    return res.send("Could not find coin");
  }
  const product = await getProduct(req.body.product_id);
  if (!product) {
    return res.send("Could not find product");
  }

  const coinpayment = {
    user_id: req.body.user_id,
    // product_ids: req.body.products,
    coin: req.body.coin,
    amount: product.price,
    email: req.body.email,
    status: 0,
    feedback: 0,
  };
  // console.log("payment", coinpayment);
  const result = await create(coinpayment);
  return res.send(result);
});

app.post("/ipn", async (req, res) => {
  const hmac = req.get(`HMAC`); //req.headers.HTTP_HMAC;
  const payload = req.body;
  // console.log(hmac, payload);
  const verify = await ipn(hmac, payload);
  if (verify) {
    // console.log("verified payment");
    await completePayment(req.body.txn_id);
  }
  // console.log("body", req.body);
  return res.status(200).send('ok');
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
