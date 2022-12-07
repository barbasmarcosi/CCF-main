const express = require("express");
const fs = require("fs");
const pdf = require("html-pdf");
const LiquidationService = require("../services/liquidation.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  updateLiquidationSchema,
  createLiquidationSchema,
  getLiquidationSchema,
} = require("../schemas/liquidation.schema");

const router = express.Router();
const service = new LiquidationService();

router.get("", async (req, res, next) => {
  try {
    const liquidations = await service.find();
    res.json(liquidations);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getLiquidationSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const liquidation = await service.findOne(id);
      res.json(liquidation);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/afip/:date", async (req, res, next) => {
  try {
    const { date } = req.params;
    const newLiquidation = await service.afip(date);
    /*pdf.create(newLiquidation[0]).toStream(function (err, stream) {
      if (err) return console.log(err);
      stream.pipe(res);
    });*/
    return res.send(newLiquidation);
  } catch (error) {
    next(error);
  }
});

router.get("/report/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const newLiquidation = await service.report(id);
    pdf.create(newLiquidation).toStream(function (err, stream) {
      if (err) return console.log(err);
      stream.pipe(res);
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validatorHandler(createLiquidationSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newLiquidation = await service.create(body);
      res.status(201).json(newLiquidation);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  validatorHandler(getLiquidationSchema, "params"),
  validatorHandler(updateLiquidationSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const liquidation = await service.update(id, body);
      res.json(liquidation);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getLiquidationSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
