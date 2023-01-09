const boom = require("@hapi/boom");
const { models } = require("../libs/sequelize");
const fs = require("fs");
const csv = require("csvtojson");
const { Op } = require("sequelize");

class PersonService {
  constructor() {}

  async backup() {
    const persons = await models.Person.findAll();
    const backup = persons
      .map(
        (person) =>
          `INSERT INTO persons VALUES (${Object.entries(person.dataValues).map(
            (entry) =>
              entry[0] == "createdAt"
                ? `'${new Date(entry[1]).toISOString()}'`
                : `'${entry[1]}'`
          )})`
      )
      .join(";\n");
    fs.writeFileSync("./backup/persons.txt", backup);
  }

  async create(data) {
    const persons = await models.Person.findAll({
      where: {
        cuit: {
          [Op.eq]: data.cuit,
        },
      },
    });
    if (persons.length) {
      return await persons[0].update(data);
    } else {
      return await models.Person.create(data);
    }
  }

  async find() {
    const rta = await models.Person.findAll({
      order: [["createdAt", "DESC"]],
    });
    return rta;
  }

  async findOne(id) {
    const person = await models.Person.findByPk(id);
    if (!person) {
      throw boom.notFound("Person not found");
    }
    return person;
  }

  async update(id, changes) {
    const person = await this.findOne(id);
    if (!person.state) {
      const rta = await person.update(changes);
      return rta;
    } else {
      const rta = await person.update({ ...changes, state: false });
      return rta;
    }
  }

  async csvToJson(path) {
    const actuals = await models.Person.findAll();
    try {
      const json = await csv({
        delimiter: [";"],
      })
        .fromFile(path)
        .then((jsonObj) => {
          return jsonObj;
        });
      json.map(async (person) => {
        const coincidence = actuals.filter((actual) => {
          return person.CUIT == actual.cuit;
        });
        if (!coincidence.length && person.CUIT) {
          await models.Person.create({
            name: person.Nombres,
            lastName: person.Apellido,
            cuit: person.CUIT,
            registration: person["Matr�cula"].replace(".", ""),
            email: person.Email,
            city: person["Dom Profesional Municipio"],
            party: person["Dom Profesional Localidad"],
            address: person["Dom Profesional"],
            phone: person["Dom Profesional Telefonos"],
            state: false,
          });
        }
        if (coincidence.length && person.CUIT) {
          coincidence[0].update({
            name: person.Nombres,
            lastName: person.Apellido,
            cuit: person.CUIT,
            registration: person["Matr�cula"].replace(".", ""),
            email: person.Email,
            city: person["Dom Profesional Municipio"],
            party: person["Dom Profesional Localidad"],
            address: person["Dom Profesional"],
            phone: person["Dom Profesional Telefonos"],
            state: false,
          });
        }
      });
    } catch (e) {
      throw boom.badRequest("Hubo un error, verifique el archivo ingresado");
    }
    return true;
  }

  async delete(id) {
    const person = await this.findOne(id);
    const bills = await models.Bill.findAll();
    const pendent = bills.filter(
      (bill) => !bill.idLiquidacion && bill.personId == person.id && !bill.state
    );
    if (!pendent.length) {
      if (!person.state) {
        return await person.update({ state: true });
      } else {
        throw new Error("Esta persona ya se encuentra anulada");
      }
    } else {
      throw new Error("Esta persona tiene facturas pendientes a liquidar");
    }
  }
}

module.exports = PersonService;
