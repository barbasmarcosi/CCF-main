const express = require("express");

const CreditNoteService = require("../services/credit.note.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  createCreditNoteSchema,
  updateCreditNoteSchema,
  getCreditNoteSchema,
} = require("../schemas/credit.note.schema");

const router = express.Router();
const service = new CreditNoteService();

router.get("/", async (req, res, next) => {
  try {
    const creditNotes = await service.find();
    res.json(creditNotes);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getCreditNoteSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const creditNote = await service.findOne(id);
      res.json(creditNote);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createCreditNoteSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCreditNote = await service.create(body);
      res.status(201).json(newCreditNote);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  validatorHandler(getCreditNoteSchema, "params"),
  validatorHandler(updateCreditNoteSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const creditNote = await service.update(id, body);
      res.json(creditNote);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getCreditNoteSchema, "params"),
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
