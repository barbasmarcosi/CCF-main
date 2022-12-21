const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const pdf = require("html-pdf");
const zlib = require("zlib");
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
  const { date } = req.params;
  try {
    const newLiquidation = await service.afip(date);
    console.log(newLiquidation)
    const checkTime = 1000;
    const timerId = setInterval(() => {
      const isExists = fs.existsSync(newLiquidation, "utf8");
      if (isExists) {
        clearInterval(timerId);
        let headers = {
          "Connection": "close", // intention
          "Content-Encoding": "gzip",
          // add some headers like Content-Type, Cache-Control, Last-Modified, ETag, X-Powered-By
        };

        let file = fs.readFileSync(newLiquidation); // sync is for readability
        let gzip = zlib.gzipSync(file); // is instance of Uint8Array
        headers["Content-Length"] = gzip.length; // not the file's size!!!

        res.writeHead(200, headers);

        let chunkLimit = 16 * 1024; // some clients choke on huge responses
        let chunkCount = Math.ceil(gzip.length / chunkLimit);
        for (let i = 0; i < chunkCount; i++) {
          if (chunkCount > 1) {
            let chunk = gzip.slice(i * chunkLimit, (i + 1) * chunkLimit);
            res.write(chunk);
          } else {
            res.write(gzip);
          }
        }
        res.end();
      }
    }, checkTime); /*
    setTimeout(() => {
      exists = fs.existsSync(newLiquidation);
      if (exists) {
        let headers = {
          "Connection": "close", // intention
          "Content-Encoding": "gzip",
          // add some headers like Content-Type, Cache-Control, Last-Modified, ETag, X-Powered-By
        };

        let file = fs.readFileSync(newLiquidation); // sync is for readability
        let gzip = zlib.gzipSync(file); // is instance of Uint8Array
        headers["Content-Length"] = gzip.length; // not the file's size!!!

        res.writeHead(200, headers);

        let chunkLimit = 16 * 1024; // some clients choke on huge responses
        let chunkCount = Math.ceil(gzip.length / chunkLimit);
        for (let i = 0; i < chunkCount; i++) {
          if (chunkCount > 1) {
            let chunk = gzip.slice(i * chunkLimit, (i + 1) * chunkLimit);
            res.write(chunk);
          } else {
            res.write(gzip);
          }
        }
        res.end();
      } else {
        throw new Error("Hubo un error, intentelo nuevamente");
      }
    }, 3000);*/
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
