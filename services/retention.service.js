const boom = require("@hapi/boom");
const { models } = require("../libs/sequelize");
const fs = require("fs");

class RetentionService {
  constructor() {}

  async backup() {
    const retentions = await models.Retention.findAll();
    const backup = retentions
      .map(
        (retention) =>
          `INSERT INTO retentions VALUES (${Object.entries(
            retention.dataValues
          ).map((entry) =>
            entry[0] == "createdAt" || entry[0] == "retentionDate"
              ? `'${new Date(entry[1]).toISOString()}'`
              : `'${entry[1]}'`
          )})`
      )
      .join(";\n");
    fs.writeFileSync("./backup/retentions.txt", backup);
  }

  async create(data) {
    const retentions = await models.Retention.findAll();
    const alreadyHave = retentions.filter(
      (retention) =>
        retention.personId == data.personId &&
        new Date(retention.retentionDate).getMonth() ==
          new Date(data.retentionDate).getMonth() &&
        new Date(retention.retentionDate).getFullYear() ==
          new Date(data.retentionDate).getFullYear()
    );
    if (!alreadyHave.length) {
      return await models.Retention.create(data);
    } else {
      throw new Error("Este matriculado ya posee una retencion este mes");
    }
  }

  async find() {
    const rta = await models.Retention.findAll({
      include: ["person"],
      order: [["createdAt", "DESC"]],
    });
    return rta;
  }

  async findOne(id) {
    const retention = await models.Retention.findByPk(id);
    if (!retention) {
      throw boom.notFound("Retention not found");
    }
    return retention;
  }

  async csvToJson(text, persons, retentions) {
    const lines = text.split("\n");
    const json = [];
    const headers = lines[0].split(";");
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split(";");
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
      json.push(obj);
    }
    const from = json[0]["Fecha de Vigencia Hasta"];
    const fileDate = new Date(
      from.slice(4, 8) + "-" + from.slice(2, 4) + "-" + from.slice(0, 2)
    ).toISOString();
    const oldRetention = retentions.filter((retention) => {
      const verify =
        new Date(retention.retentionDate).getMonth() - new Date().getMonth();
      if (!((verify > -3 && verify < 1) || verify > 9)) {
        return retention;
      }
    });
    oldRetention.map((retention) => {
      retention.destroy();
    });
    const verify = new Date(fileDate).getMonth() - new Date().getMonth();
    console.log(new Date(fileDate).getMonth(), new Date().getMonth());
    console.log(verify);
    if ((verify > -3 && verify < 1) || verify > 9) {
      json.map(async (object) => {
        const coincidence = persons.filter((person) => {
          return person.cuit == object["Numero CUIT"];
        });
        if (coincidence.length) {
          const alredyHave = retentions.filter(
            (retention) =>
              retention.personId == coincidence[0].id &&
              new Date(retention.retentionDate).getMonth() ==
                new Date(fileDate).getMonth() &&
              new Date(retention.retentionDate).getFullYear() ==
                new Date(fileDate).getFullYear()
          );
          if (alredyHave.length && alredyHave[0].state) {
            await alredyHave[0].update({ state: false });
          } else if (!alredyHave.length) {
            const alicuota = Number(object.Alicuota.replace(",", ".")) / 100;
            await models.Retention.create({
              retention: alicuota,
              state: false,
              personId: coincidence[0].id,
              retentionDate: fileDate,
            });
          }
        }
        return true;
      });
    } else {
      throw new Error(
        "El archivo de retenciones tiene mas de 3 meses de diferencia"
      );
    }
  }

  async update(id, changes) {
    const retention = await this.findOne(id);
    const rta = await retention.update(changes);
    return rta;
  }

  async delete(id) {
    const retention = await this.findOne(id);
    await retention.update({ state: true });
    return { id };
  }
}

module.exports = RetentionService;
