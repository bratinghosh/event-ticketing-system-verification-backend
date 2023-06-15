require("dotenv/config")
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const accountsRoute = require("./routes/accounts");

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/accounts", accountsRoute);

// Database
mongoose.connect(
    process.env.DATABASE_URL,
    {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("connected to database successfully..."))
.catch((err) => { console.error(err); });

app.listen(process.env.PORT, () => console.log("app started on port " + process.env.PORT+ "..."));
