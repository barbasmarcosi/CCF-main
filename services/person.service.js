const boom = require("@hapi/boom");
const csv = require("csvtojson");
const { models } = require("../libs/sequelize");

class PersonService {
  constructor() {}

  async create(data) {
    const persons = await models.Person.findAll();
    let newPerson;
    const alreadyExists = persons.filter((person) => person.cuit == data.cuit);
    if (alreadyExists.length) {
      await alreadyExists[0].update(data);
    } else {
      await models.Person.create(data);
    }
    return newPerson;
  }

  async find() {
    const rta = await models.Person.findAll();
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
    const rta = await person.update(changes);
    return rta;
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
            city: person['Dom Particular Municipio'],
            party: person['Dom Particular Localidad'],
            address: person['Dom Particular'],
            phone: person['Dom Particular Telefonos'],
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
      (bill) => !bill.idLiquidacion && bill.personId == person.id
    );
    if (!pendent.length) {
      return await person.update({ state: true });
    } else {
      throw new Error("Esta persona tiene facturas pendientes a liquidar");
    }
  }
}

module.exports = PersonService;
