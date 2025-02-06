const express = require("express");
const app = express();
const port = 5000;

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://admin:test1234@cluster0.u1jms.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
