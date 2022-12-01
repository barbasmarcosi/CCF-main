const express = require("express");
const multer = require("multer");
const fs = require("fs");
const RetentionService = require("../services/retention.service");
const { models } = require("../libs/sequelize");
const validatorHandler = require("../middlewares/validator.handler");
const {
  createRetentionSchema,
  updateRetentionSchema,
  getRetentionSchema,
} = require("../schemas/retention.schema");

const router = express.Router();
const service = new RetentionService();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./dist");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  /*storage: multer.memoryStorage(),
  limits: {
    fieldNameSize: 255,
    fileSize: 500000,
    files: 1,
    fields: 1,
  },*/
});

router.post("/toJson", upload.single("file"), async (req, res, next) => {
  try {
    let response;
    const file = req.file;
    if (!file) {
      const error = new Error("Ingrese un archivo");
      error.httpStatusCode = 400;
      return next(error);
    } else if (
      file.filename
        .slice(file.filename.length - 3, file.filename.length)
        .toLowerCase() != "txt"
    ) {
      const error = new Error("Verifique el archivo ingresado");
      error.httpStatusCode = 400;
      return next(error);
    }
    const filePath = file.path;
    const filesToCsv = async (finalFile) => {
      const persons = await models.Person.findAll();
      const retentions = await models.Retention.findAll();
      exist = await service.csvToJson(finalFile, persons, retentions);
    };
    const deleteFiles = async () => {
      fs.unlinkSync(filePath);
    };
    const putRetentions = async () => {
      const headers =
        "Regimen;Fecha de Publicacion;Fecha de Vigencia Desde;Fecha de Vigencia Hasta;Numero CUIT;Tipo Contribuyente Insc;Marca Alta - Baja - Sujeto;Marca cambio alicuota;Alicuota;Nro Grupo\n";
      const text = fs.readFileSync(filePath);
      const textWithHeaders = headers + text;
      const finalFile = textWithHeaders.replace(/;\r\n/g, "\n");
      response = await filesToCsv(finalFile);
      await deleteFiles();
      return true;
    };
    await putRetentions();
    res.json(response);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const retentions = await service.find();
    res.json(retentions);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  validatorHandler(getRetentionSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const retention = await service.findOne(id);
      res.json(retention);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createRetentionSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newRetention = await service.create(body);
      res.status(201).json(newRetention);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  validatorHandler(getRetentionSchema, "params"),
  validatorHandler(updateRetentionSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const retention = await service.update(id, body);
      res.json(retention);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getRetentionSchema, "params"),
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
