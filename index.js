const express = require("express");
const cors = require("cors");
const fs = require("fs");
const LiquidationService = require("./services/liquidation.service");
const PersonService = require("./services/person.service");
const RetentionService = require("./services/retention.service");
const BillService = require("./services/bill.service");
const CreditNoteService = require("./services/credit.note.service");

const routerApi = require("./routes"); //el archivo index.js se busca en automático
const {
  logErrors,
  errorHandler,
  boomErrorHandler,
} = require("./middlewares/error.handler");
const lService = new LiquidationService();
const PService = new PersonService();
const RService = new RetentionService();
const BService = new BillService();
const CNService = new CreditNoteService();
const app = express();
const port = 5000;

app.use(express.json()); //este es un Middleware

const whitelist = [
  "http://localhost:5500",
  "http://localhost:3000",
  "http://localhost:5502",
  "http://localhost:5501",
];
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("No tiene permiso para acceder"));
    }
  },
};
app.use(cors(options));
const newFiles = async () => {
  const exists = await fs.existsSync("newFiles");
  if (exists) {
    await fs.rmSync("newFiles", { recursive: true }, (a) => console.log(a));
  }
  await fs.mkdirSync("newFiles", (a) => console.log(a));
};

const dist = async () => {
  const exists = await fs.existsSync("dist");
  if (exists) {
    await fs.rmSync("dist", { recursive: true }, (a) => console.log(a));
  }
  await fs.mkdirSync("dist", (a) => console.log(a));
};

const exists = fs.existsSync("backup");
if (!exists) {
  fs.mkdirSync("backup", (a) => console.log(a));
}

lService.backup();
PService.backup();
RService.backup();
BService.backup();
CNService.backup();

newFiles();
dist();

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`On port http://localhost:${port}`);
});
