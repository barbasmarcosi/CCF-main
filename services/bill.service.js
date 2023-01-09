const boom = require("@hapi/boom");
const { models } = require("../libs/sequelize");
const fs = require("fs");

class BillService {
  constructor() {}

  async backup() {
    const bills = await models.Bill.findAll();
    const backup = bills
      .map(
        (bill) =>
          `INSERT INTO bills VALUES (${Object.entries(bill.dataValues).map(
            (entry) =>
              entry[0] == "createdAt" || entry[0] == "billDate"
                ? `'${new Date(entry[1]).toISOString()}'`
                : `'${entry[1]}'`
          )})`
      )
      .join(";\n");
    fs.writeFileSync("./backup/bills.txt", backup);
  }

  async create(data) {
    const res = await models.Bill.create(data);
    return res;
  }

  async find() {
    const rta = await models.Bill.findAll({
      include: ["person"],
      order: [["createdAt", "DESC"]],
    });
    return rta;
  }

  async findOne(id) {
    const bill = await models.Bill.findByPk(id);
    if (!bill) {
      throw Error("Bill not found");
    }
    return bill;
  }

  async report(data) {
    let response;
    const bills = await models.Bill.findAll({
      include: ["person"],
    });
    const inDate = bills.filter(
      (bill) =>
        new Date(data.from) <= bill.billDate &&
        new Date(data.to) >= bill.billDate &&
        !bill.state
    );
    if (!inDate.length) {
      throw new Error("No se encontraron facturas en el periodo seleccionado");
    } else {
      const wb = new xl.Workbook({
        dateFormat: "dd/mm/yyyy",
        alignment: {
          wrapText: false,
          horizontal: "center",
        },
      });
      const ws = wb.addWorksheet("Informe");
      const headingColumnNames = [
        "Numero de factura",
        "Tipo",
        "Documento",
        "Monto",
        "% Gastos administrativos",
        "Total luego de gastos administrativos",
        "Fecha de factura",
        "CUIT",
        "Nombre completa",
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
            columnName == "personId" ||
            columnName == "state" ||
            columnName == "createdAt" ||
            columnName == "description" ||
            columnName == "id" ||
            columnName == "liquidationId"
          ) {
            true;
          } else if (columnName == "billDate") {
            ws.cell(rowIndex, columnIndex++).date(
              `${record.dataValues[columnName]}`
            );
          } else if (columnName == "amount") {
            ws.cell(rowIndex, columnIndex++).number(
              Number(record.dataValues[columnName])
            );
          } else if (columnName == "adminExpenses") {
            ws.cell(rowIndex, columnIndex++).number(
              Number(record.dataValues[columnName])
            );
            ws.cell(rowIndex, columnIndex++).formula(
              `D${rowIndex}-D${rowIndex}*(E${rowIndex}/100)`
            );
          } else {
            ws.cell(rowIndex, columnIndex++).string(
              `${record.dataValues[columnName]}`
            );
          }
        });
        rowIndex++;
      });
      ws.cell(rowIndex, 4).formula(`SUM(D2:D${rowIndex - 1})`);
      ws.cell(rowIndex, 6).formula(`SUM(F2:F${rowIndex - 1})`);
      return wb.writeToBuffer();
    }
  }

  async update(id, changes) {
    const bill = await this.findOne(id);
    if (!bill.liquidationId && !bill.state) {
      return await bill.update(changes);
    } else {
      if (bill.state) {
        throw boom.notFound(
          "No se puede modificar porque la factura se encuentra anulada"
        );
      }
      throw boom.notFound(
        "No se puede modificar porque la factura se encuentra liquidada"
      );
    }
  }

  async delete(id) {
    const bill = await this.findOne(id);
    if (!bill.liquidationId && !bill.state) {
      await bill.update({ state: true });
    } else {
      if (bill.state) {
        throw boom.notFound("La factura ya se encuentra anulada");
      }
      throw boom.notFound(
        "No se puede anular porque la factura se encuentra liquidada"
      );
    }
    return { id };
  }
}

module.exports = BillService;
