exports.up = function (knex, Promise) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("password");
      table.string("email");
      table.string("gender");
      table.string("photo");
      table.string("nickname");
      table.string("description");
      table.timestamps(false, true);
    })
    .then(() => {
      return knex.schema.createTable("events", (events) => {
        events.increments("id").primary();
        events.string("name");
        events.string("categories");
        events.dateTime("date");
        events.string("photo");
        events.string("description");
        events.string("location");
        events.integer("max_participants");
        events.integer("user_id").unsigned();
        events.foreign("user_id").references("users.id");
        events.timestamps(false, true);
      });
    })
    .then(() => {
      return knex.schema.createTable("chatrooms", (chatrooms) => {
        chatrooms.increments("id").primary();
        chatrooms.integer("event_id").unsigned().unique();
        chatrooms.foreign("event_id").references("events.id");
      });
    })
    .then(() => {
      return knex.schema.createTable("users_events", (usersEvents) => {
        usersEvents.increments("id").primary();
        usersEvents.integer("user_id").unsigned();
        usersEvents.foreign("user_id").references("users.id");
        usersEvents.integer("event_id").unsigned();
        usersEvents.foreign("event_id").references("events.id");
        usersEvents.boolean("acceptance");
      });
    })
    .then(() => {
      return knex.schema.createTable("users_chatrooms", (usersChatrooms) => {
        usersChatrooms.increments("id").primary();
        usersChatrooms.integer("chatroom_id").unsigned();
        usersChatrooms.foreign("chatroom_id").references("chatrooms.id");
        usersChatrooms.integer("user_id").unsigned();
        usersChatrooms.foreign("user_id").references("users.id");
        usersChatrooms.string("message");
      });
    });
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable("users_chatrooms")
    .then(() => knex.schema.dropTable("users_events"))
    .then(() => knex.schema.dropTable("chatrooms"))
    .then(() => knex.schema.dropTable("events"))
    .then(() => knex.schema.dropTable("users"));
};
