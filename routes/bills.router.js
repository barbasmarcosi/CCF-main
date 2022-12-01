const express = require("express");

const BillService = require("../services/bill.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  createBillSchema,
  updateBillSchema,
  getBillSchema,
} = require("../schemas/bill.schema");

const router = express.Router();
const service = new BillService();

router.get("/", async (req, res, next) => {
  try {
    const bills = await service.find();
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getBillSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const bill = await service.findOne(id);
      res.json(bill);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createBillSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newBill = await service.create(body);
      res.status(201).json(newBill);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/report", async (req, res, next) => {
  try {
    const body = req.body;
    const newLiquidation = await service.report(body);
    res.send(newLiquidation);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  validatorHandler(getBillSchema, "params"),
  validatorHandler(updateBillSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const bill = await service.update(id, body);
      res.json(bill);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getBillSchema, "params"),
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
