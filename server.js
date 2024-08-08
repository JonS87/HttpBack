const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
// const path = require("path");
const cors = require("@koa/cors");

let tickets = [];
let nextId = 1;

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

tickets.push({
  id: nextId++,
  name: "Поменять краску в притере, ком. 404",
  description: "Это первая тестовая заявка",
  status: false,
  created: new Date("2019-03-10T08:40:00"),
});
tickets.push({
  id: nextId++,
  name: "Переустановить Windows, ПК-Hall24",
  description: "Это вторая тестовая заявка",
  status: false,
  created: new Date("2019-03-15T12:35:00"),
});
tickets.push({
  id: nextId++,
  name: "Установить обновление КВ-ХХХ",
  description: `Вышло критическое обвноление для Windows, нужно\n
поставить обновления в следующем приоритете:\n
1. Сервера (не забыть сделать бэкап!)\n
2. Рабочие станции`,
  status: true,
  created: new Date("2019-03-15T12:40:00"),
});

router.get("/tickets", async (ctx) => {
  const { method, id } = ctx.request.query;

  switch (method) {
    case "allTickets": {
      ctx.response.body = tickets.map(({ id, name, status, created }) => ({
        id,
        name,
        status,
        created,
      }));

      return;
    }
    case "ticketById": {
      const ticket = tickets.find((t) => t.id === parseInt(id));

      if (!ticket) {
        ctx.response.status = 404;

        return;
      }

      ctx.response.body = ticket;
      return;
    }
    default: {
      ctx.response.status = 404;
      return;
    }
  }
});

router.post("/tickets", async (ctx) => {
  const method = ctx.request.query.method;

  if (method !== "createTicket") {
    ctx.response.status = 400;
    ctx.response.body = { error: "Неверный метод" };

    return;
  }

  const { name, description } = ctx.request.body;
  const newTicket = {
    id: nextId++,
    name,
    description,
    status: false,
    created: Date.now(),
  };

  tickets.push(newTicket);
  ctx.response.body = newTicket;
  ctx.response.status = 201;
});

router.patch("/tickets", async (ctx) => {
  const { method, id, status } = ctx.request.query;
  const { name, description } = ctx.request.body;

  switch (method) {
    case "ticketById": {
      let ticket;
      for (let i = 0; i < tickets.length; i++) {
        if (tickets[i].id === parseInt(id)) {
          ticket = i;
          break;
        }
      }

      if (!ticket && ticket !== 0) {
        ctx.response.status = 404;

        return;
      }

      if (status) {
        tickets[ticket].status = JSON.parse(status);
      } else {
        tickets[ticket].name = name;
        tickets[ticket].description = description;
      }
      ctx.response.status = 200;

      return;
    }
    default: {
      ctx.response.status = 404;
      return;
    }
  }
});

router.delete("/tickets", async (ctx) => {
  const { method, id } = ctx.request.query;

  switch (method) {
    case "ticketById": {
      const ticket = tickets.find((t) => t.id === parseInt(id));

      // console.log(ticket);
      if (!ticket) {
        ctx.response.status = 404;

        return;
      }

      tickets = tickets.filter((t) => t.id !== parseInt(id));
      ctx.response.status = 200;

      return;
    }
    default: {
      ctx.response.status = 404;
      return;
    }
  }
});

app.use(router.routes()).use(router.allowedMethods());

const server = http.createServer(app.callback());

const port = process.env.PORT || 7070;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log("Server is listening to " + port);
});
