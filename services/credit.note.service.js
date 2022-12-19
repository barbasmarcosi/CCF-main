const boom = require("@hapi/boom");
const { models } = require("../libs/sequelize");
const fs = require("fs");

class CreditNoteService {
  constructor() {}

  async backup() {
    const creditNotes = await models.CreditNote.findAll();
    const backup = creditNotes
      .map(
        (creditNote) =>
          `INSERT INTO creditNotes VALUES (${Object.entries(creditNote.dataValues).map(
            (entry) =>
              entry[0] == "createdAt"
                ? `'${new Date(entry[1]).toISOString()}'`
                : `'${entry[1]}'`
          )})`
      )
      .join(";\n");
    fs.writeFileSync("./backup/creditNotes.txt", backup);
  }

  async create(data) {
    const res = await models.CreditNote.create(data);
    return res;
  }

  async find() {
    const rta = await models.CreditNote.findAll({
      include: ["person"],
    });
    return rta;
  }

  async findOne(id) {
    const creditNote = await models.CreditNote.findByPk(id);
    if (!creditNote) {
      throw Error("Credit note not found");
    }
    return creditNote;
  }

  async update(id, changes) {
    const creditNote = await this.findOne(id);
    if (!creditNote.liquidationId && !creditNote.state) {
      return await creditNote.update(changes);
    } else {
      if (creditNote.state) {
        throw boom.notFound(
          "No se puede modificar porque la nota de crédito se encuentra anulada"
        );
      }
      throw boom.notFound(
        "No se puede modificar porque la nota de crédito se encuentra liquidada"
      );
    }
  }

  async delete(id) {
    const creditNote = await this.findOne(id);
    if (!creditNote.liquidationId && !creditNote.state) {
      await creditNote.update({ state: true });
    } else {
      if (creditNote.state) {
        throw boom.notFound(
          "La nota de crédito ya se encuentra anulada"
        );
      }
      throw boom.notFound(
        "No se puede anular porque la nota de crédito se encuentra liquidada"
      );
    }
    return { id };
  }
}

module.exports = CreditNoteService;
