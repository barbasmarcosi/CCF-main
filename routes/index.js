const express = require("express");

const billsRouter = require("./bills.router");
const personsRouter = require("./persons.router");
const liquidationsRouter = require("./liquidations.router");
const retentionsRouter = require("./retentions.router");
const creditNoteRouter = require("./credit.note.router");

function routerApi(app) {
  const router = express.Router();
  app.use("/api", router);
  router.use("/bills", billsRouter);
  router.use("/persons", personsRouter);
  router.use("/liquidations", liquidationsRouter);
  router.use("/retentions", retentionsRouter);
  router.use("/creditNote", creditNoteRouter);
}

module.exports = routerApi;
