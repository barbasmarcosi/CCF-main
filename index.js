const express = require("express");
const cors = require("cors");

const routerApi = require("./routes"); //el archivo index.js se busca en automático
const {
  logErrors,
  errorHandler,
  boomErrorHandler,
} = require("./middlewares/error.handler");

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

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`On port http://localhost:${port}`);
});
