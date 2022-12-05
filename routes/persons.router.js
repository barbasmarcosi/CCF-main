const express = require("express");
const multer = require("multer");
const fs = require("fs");
const PersonService = require("../services/person.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  updatePersonSchema,
  createPersonSchema,
  getPersonSchema,
} = require("../schemas/person.schema");

const router = express.Router();
const service = new PersonService();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./dist");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/toJson", upload.single("file"), async (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Ingrese un archivo");
    error.httpStatusCode = 400;
    return next(error);
  }
  const ext = file.filename
    .slice(file.filename.length - 3, file.filename.length)
    .toLowerCase();
  const filePath = file.path;
  const fileText = fs.readFileSync(filePath, "utf8");
  if (ext.toLowerCase() === "csv") {
    const cleanedCsv = fileText.replace(
      /(;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;\r\n)/g,
      ""
    );
    fs.writeFileSync(filePath, cleanedCsv);
  }else {
    const error = new Error("Formato archivo no valido");
    error.httpStatusCode = 400;
    return next(error);
  }
  const newJson = await service.csvToJson(filePath);
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
  }
  res.json(newJson);
});

router.get("", async (req, res, next) => {
  try {
    const persons = await service.find();
    res.json(persons);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getPersonSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const person = await service.findOne(id);
      res.json(person);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createPersonSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newPerson = await service.create(body);
      res.status(201).json(newPerson);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  validatorHandler(getPersonSchema, "params"),
  validatorHandler(updatePersonSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const person = await service.update(id, body);
      res.json(person);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getPersonSchema, "params"),
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
