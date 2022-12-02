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
        </head>
        <body style="diplay: flex; margin: 2rem 2rem 2rem 2rem; text-align: center;">
            <div id="pageHeader" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                <p style="margin-left: 3rem;">Colegio de Psicologas y Psiclogos de Trenque Lauquen</p>
                <p style="margin-left: 3rem;">Informe de Liquidacion</p>
                <p style="margin-left: 3rem;">Fecha y hora de emision: ${new Date().toLocaleString()}</p>
            </div>
            <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;">Informe de Liquidacion</p>
            </div>
            <div style="border-bottom: 1px solid #ddd; text-align: left;">
            <h3>Nombre completo : ${report.person.lastName} ${
      report.person.name
    }</h3>
            <h3>CUIT : ${report.person.cuit.slice(
              0,
              2
            )}-${report.person.cuit.slice(2, 10)}-${report.person.cuit.slice(
      10,
      12
    )}</h3>
            <h3>Fecha de liquidacion: ${new Date(
              report.createdAt
            ).toLocaleString()}</h3>
            <h3>Subtotal: $${report.monthAmount.toFixed(2)}</h3>
            <h3>Retencion aplicada: ${report.retention.toFixed(2)}%</h3>
            <h3>Monto Retenido: $${report.retainedAmount.toFixed(2)}</h3>
            <h3>Monto Final: $${(
              report.monthAmount - report.retainedAmount
            ).toFixed(2)}</h3>
            </div>
            <div>
            <table style="border-collapse: collapse; border: 1px solid black; text-align: center; font-size: 1px;">
              <thead style="font-size: 1px;">
                <th style="border: 1px solid black; font-size: 16px;">Numero de factura</th>
                <th style="border: 1px solid black; font-size: 16px;">Fecha de factura</th>
                <th style="border: 1px solid black; font-size: 16px;">Importe antes de impuesto</th>
                <th style="border: 1px solid black; font-size: 16px;">Tipo de factura</th>
                <th style="border: 1px solid black; font-size: 16px;">Importe luego de impuesto</th>
                <th style="border: 1px solid black; font-size: 16px;">Gastos amionistrativos</th>
                <th style="border: 1px solid black; font-size: 16px;">Importe luego de gastos adminitrativos</th>
              </thead>
              ${(`${report.retentions.map((retention) => {
                return `<tr style="border: 1px solid black; text-align: center; font-size: 16px;">
                     <td style="border: 1px solid black;" >${
                       retention.billNumber
                     }</td>
                     <td style="border: 1px solid black;" >${new Date(
                       retention.billDate
                     ).toLocaleDateString()}</td>
                     <td style="border: 1px solid black;" >$${
                       retention.initialAmount
                     }</td>
                     <td style="border: 1px solid black;" >${
                       retention.billType
                     }</td>
                     <td style="border: 1px solid black;" >$${
                       retention.finalAmount
                     }</td>
                     <td style="border: 1px solid black;" >${
                       retention.adminExpenses
                     }%</td>
                     <td style="border: 1px solid black;" >$${(
                       retention.finalAmount *
                       (1 - retention.adminExpenses / 100)
                     ).toFixed(2)}</td>
                </tr>`;
              })}`).split(',').join('')}
            </table>
        </body>
    </html>
`;
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
