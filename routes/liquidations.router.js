const express = require("express");
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

router.post("/report/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const newLiquidation = await service.report(id);
    console.log(newLiquidation)
    pdf.create(newLiquidation).toStream((err, stream) => {
      if (err) {
        logger.error(">>> Error while generating pdf at %s", req.url, err);
        return next(err);
      }
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
