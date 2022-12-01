const boom = require("@hapi/boom");
const { models } = require("../libs/sequelize");
const BillService = require("./bill.service");
const xl = require("excel4node");
const billService = new BillService();
const { Op } = require("sequelize");
const pdf = require("html-pdf");

class LiquidationService {
  constructor() {}

  async create(data) {
    let res = false;
    const retentions = await models.Retention.findAll();
    const liquidationDate = new Date();
    const retentionMonth = retentions.filter(
      (retention) =>
        retention.personId == data.personId &&
        retention.retentionDate.getFullYear() ==
          liquidationDate.getFullYear() &&
        retention.retentionDate.getMonth() == liquidationDate.getMonth() &&
        !retention.state
    );
    if (retentionMonth.length) {
      const bills = await models.Bill.findAll();
      const verifyMax = bills.filter((bill) => bill.personId == data.personId);
      let monthAmount = 0;
      verifyMax.map((bill) => (monthAmount += bill.finalAmount));
      const monthBills = bills.filter((bill) => {
        return (
          bill.personId == data.personId && !bill.state && !bill.liquidationId
        );
      });
      if (monthBills.length) {
        let total = 0;
        const id = (await models.Liquidation.findAll()).length + 1;
        monthBills.map(async (bill) => {
          total =
            total +
            (bill.finalAmount - bill.finalAmount * (bill.adminExpenses / 100));
          await bill.update({
            liquidationId: id,
          });
        });
        let retainedAmount;
        if (monthAmount > data.maxAllowed) {
          retainedAmount = total * retentionMonth[0].retention;
        } else {
          retainedAmount = total;
        }
        if (total) {
          res = true;
          await models.Liquidation.create({
            monthAmount: total,
            retainedAmount: retainedAmount,
            personId: data.personId,
            retention: retentionMonth[0].retention * 100,
            state: false,
          });
        }
      } else {
        throw boom.notFound("Esta persona no posee facturas sin liquidar");
      }
    } else {
      throw boom.notFound(
        "Esta persona no posee una rentencion asignada en la fecha solicitada"
      );
    }
    return res;
  }

  async report(id) {
    const liquidations = await models.Liquidation.findByPk(id, {
      include: ["person"],
    });
    const bills = await models.Bill.findAll({
      where: {
        liquidationId: {
          [Op.eq]: id,
        },
      },
      attributes: { exclude: ["liquidationId"] },
    });
    const report = {
      ...liquidations.dataValues,
      retentions: [...bills],
    };
    //console.log(report[0]);

    const content = `
<!doctype html>
    <html>
       <head>
            <meta charset="utf-8">
            <title>PDF Result Template</title>
            <style>
                h1 {
                    color: green;
                }
            </style>
        </head>
        <body>
            <div id="pageHeader" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                <p>Colegio de Psicologas y Psiclogos de Trenque Lauquen</p>
            </div>
            <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;">Informe de Liquidacion</p>
            </div>
            <h2>Nombre completo : ${report.person.lastName} ${
      report.person.name
    }</h2>
            <h2>Fecha: ${new Date(report.createdAt).toLocaleString()}</h2>
            <h2>Subtotal: ${report.monthAmount.toFixed(2)}</h2>
            <h2>Retencion aplicada: ${report.retention.toFixed(2)}</h2>
            <h2>Monto Retenido: ${report.retainedAmount.toFixed(2)}</h2>
            <h2>Monto Final: ${(
              report.monthAmount - report.retainedAmount
            ).toFixed(2)}</h2>
            ------------------------------------------------------------------------------------------------------------------------------------------------------
            <table>
              <tr>
                <th>Numero de factura</th>
                <th>Fecha de factura</th>
                <th>Importe antes de impuesto</th>
                <th>Tipo de factura</th>
                <th>Importe luego de impuesto</th>
                <th>Gastos amionistrativos</th>
                <th>Importe luego de gastos adminitrativos</th>
              </tr>}
              ${report.retentions.map((retention) => {
                `<tr>${`<td>${retention.billNumber}</td><td>${new Date(
                  retention.billDate
                ).toLocaleString()}</td><td>${
                  retention.initialAmount
                }</td><td>${retention.billType}</td><td>${
                  retention.finalAmount
                }</td><td>${retention.adminExpenses}%</td><td>${
                  retention.finalAmount * (1 - retention.adminExpenses / 100)
                }</td>`}</tr>`;
              })}
            </table>)}
              
            <p>Generando un PDF con un HTML sencillo</p>
        </body>
    </html>
`;
    //const res2 = pdf.create(content);
    /*const buff = 0;
    const ads = app.renderToHTML(req, res, "/nametags", params).then((html) => {
      pdf.create(content).toStream((err, stream) => {
        if (err) {
          logger.error(">>> Error while generating pdf at %s", req.url, err);
          return next(err);
        }
        stream.pipe(res);
      });
    });

    console.log(asd);*/
    /*let res = pdf.create(content).toFile("./html-pdf.pdf", (err, response) => {
      if (err) {
        return err;
      } else {
        return response;
      }
    });*/
    /*
    const wb = new xl.Workbook({
      dateFormat: "dd/mm/yyyy",
      alignment: {
        wrapText: false,
        horizontal: "center",
      },
    });
    const ws = wb.addWorksheet("Informe de Liquidaciones");
    const headingColumnNames = [
      "Monto total luego de gastos administrativos",
      "Monto retenido",
      "% Retencion",
      "Monto luego de gastos administrativos y de las rentenciones",
      "Fecha de liquidacion",
      "CUIT",
      "Nombre completo",
    ];
    let headingColumnIndex = 1;
    headingColumnNames.forEach((heading) => {
      ws.cell(1, headingColumnIndex++).string(heading);
    });
    let rowIndex = 2;
    inDate.forEach((record) => {
      let columnIndex = 1;
      Object.keys(record.dataValues).forEach((columnName) => {
        if (columnName == "person") {
          ws.cell(rowIndex, columnIndex++).number(
            Number(record.dataValues[columnName].cuit)
          );
          ws.cell(rowIndex, columnIndex++).string(
            `${record.dataValues[columnName].name} ${record.dataValues[columnName].lastName}`
          );
        } else if (
          columnName == "id" ||
          columnName == "personId" ||
          columnName == "state"
        ) {
          true;
        } else if (columnName == "monthAmount") {
          ws.cell(rowIndex, columnIndex++).number(
            Number(record.dataValues[columnName].toFixed(2))
          );
        } else if (columnName == "retainedAmount") {
          ws.cell(rowIndex, columnIndex++).number(
            Number(record.dataValues[columnName].toFixed(2))
          );
          ws.cell(rowIndex, columnIndex++).formula(
            `(B${rowIndex}/A${rowIndex})*100`
          );
          ws.cell(rowIndex, columnIndex++).formula(`A${rowIndex}-B${rowIndex}`);
        } else if (columnName == "createdAt") {
          ws.cell(rowIndex, columnIndex++).date(record.dataValues[columnName]);
        } else {
          ws.cell(rowIndex, columnIndex++).string(
            `${record.dataValues[columnName]}`
          );
        }
      });
      rowIndex++;
    });
    ws.cell(rowIndex, 1).formula(`SUM(A2:A${rowIndex - 1})`);
    ws.cell(rowIndex, 2).formula(`SUM(B2:B${rowIndex - 1})`);
    return wb.writeToBuffer();*/
    return content;
  }

  async find() {
    const rta = await models.Liquidation.findAll({
      include: ["person"],
    });
    return rta;
  }

  async findOne(id) {
    const liquidation = await models.Liquidation.findByPk(id);
    if (!liquidation) {
      throw boom.notFound("Liquidation not found");
    }
    return liquidation;
  }

  async update(id, changes) {
    const liquidation = await this.findOne(id);
    const rta = await liquidation.update(changes);
    return rta;
  }

  async delete(id) {
    const liquidation = await this.findOne(id);
    const bills = await billService.find();
    bills.map(async (bill) => {
      if (bill.liquidationId == id) {
        await bill.update({ liquidationId: null });
      }
    });
    await liquidation.update({ state: true });
    return { id };
  }
}

module.exports = LiquidationService;
