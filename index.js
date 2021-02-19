"use strict";

const express = require("express");
const app = express();
const path = require("path");

const { host, storage } = require("./serverConfig.json");

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express started on port 3000");

const { createDataStorage } = require(path.join(
  __dirname,
  storage.storageFolder,
  storage.dataLayer
));

const dataStorage = createDataStorage();

const homePath = path.join(__dirname, "home");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "pageviews"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render(homePath);
});
// get all computers //
app.get("/all", (req, res) => {
  dataStorage
    .getAll()
    .then((data) => res.render("allComputers", { result: data }));
});
// get specific computer
app.get("/getcomputer", (req, res) => {
  dataStorage.getAll().then((result) => {
    res.render("getComputer", {
      title: "Get",
      header: "Which one?",
      action: "/getcomputer",
      button: "Search",
      result: result,
    });
  });
});

app.post("/getcomputer", (req, res) => {
  if (!req.body) res.sendStatus(500);

  const id = req.body.id;
  dataStorage
    .get(id)
    .then((computer) => res.render("computerPage", { result: computer }))
    .catch((error) => sendErrorPage(res, error));
});

//INSERT
// Inserting a new computer to database
app.get("/insertform", (req, res) =>
  res.render("form", {
    title: "Insert",
    header: "Add new computer to database",
    action: "/insert",
    button: "Add",
    result: null,
    id: { value: "", readonly: "" },
    name: { value: "", readonly: "" },
    type: { value: "", readonly: "" },
    amount: { value: "", readonly: "" },
    price: { value: "", readonly: "" },
  })
);

// Posting request from /insert page
app.post("/insert", (req, res) => {
  if (!req.body) res.sendStatus(500);

  dataStorage
    .insert(req.body)
    .then((status) => sendStatusPage(res, status))
    .catch((error) => sendErrorPage(res, error));
});
// update computer

app.get("/updateform", (req, res) => {
  dataStorage.getAll().then((result) => {
    res.render("form", {
      title: "Update Computer",
      header: "Update Computer data",
      action: "/updatedata",
      button: "Update",
      result: result,
      id: { value: "", readonly: "" },
      name: { value: "", readonly: "readonly" },
      type: { value: "", readonly: "readonly" },
      amount: { value: "", readonly: "readonly" },
      price: { value: "", readonly: "readonly" },
    });
  });
});

app.post("/updatedata", async (req, res) => {
  if (!req.body) {
    res.sendStatus(500);
  } else {
    try {
      const id = req.body.id;
      const computer = await dataStorage.get(id);
      res.render("form", {
        title: "Update computer",
        header: "Update computer data",
        action: "/updatecomputer",
        button: "Update",
        result: null,
        id: { value: computer.id, readonly: "readonly" },
        name: { value: computer.name, readonly: "" },
        type: { value: computer.type, readonly: "" },
        amount: { value: computer.amount, readonly: "" },
        price: { value: computer.price, readonly: "" },
      });
    } catch (error) {
      sendErrorPage(res, error);
    }
  }
});

app.post("/updatecomputer", (req, res) => {
  if (!req.body) res.sendStatus(500);
  else
    dataStorage
      .update(req.body)
      .then((status) => sendStatusPage(res, status))
      .catch((error) => sendErrorPage(res, error));
});
// remove computer //
app.get("/removecomputer", (req, res) => {
  dataStorage.getAll().then((result) => {
    res.render("getcomputer", {
      title: "Remove",
      header: "Remove a computer",
      action: "/removecomputer",
      button: "Remove",
      result: result,
    });
  });
});

app.post("/removecomputer", (req, res) => {
  if (!req.body) res.sendStatus(500);
  console.log(req.body.id);
  dataStorage
    .remove(req.body.id)
    .then((status) => sendStatusPage(res, status))
    .catch((error) => sendErrorPage(res, error));
});

app.listen(process.env.PORT || port, process.env.HOST || host, () =>
  console.log(`Server ${host}:${port} running`)
);

function sendErrorPage(res, error) {
  res.end();
}

function sendErrorPage(res, error, title = "Error", header = "Error") {
  sendStatusPage(res, error, title, header);
}

function sendStatusPage(res, status, title = "Status", header = "A-OK!") {
  return res.render("statusPage", { title, header, status });
}
