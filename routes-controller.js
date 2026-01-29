const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { search_chat } = require("./chat-model");
const http = express();
require("dotenv").config();

const port = process.env.port;

http.set("view engine", "ejs");

http.use(express.json());

http.use(express.urlencoded({ extended: true }));

http.use(
  session({
    secret: "rahasia-kandilo-chat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

const User = require(process.env.user_model);
const {
  chat_sending,
  show_chat_sender,
  show_chat_recipent,
  chat_data,
  chat_Sending,
  chat_delete,
} = require(process.env.chat_model);
const { time, day } = require(process.env.time_file);
// user controller

http.get("/user-register", (input, output) => {
  output.render("user-data-get", {
    status: "start-register",
  });
});

http.post("/user-register-process", async function (input, output) {
  const data = new User({
    username: input.body.username_input,
    email: input.body.email_input,
    password: input.body.password_input,
    passwordHash: await bcrypt.hash(
      input.body.email_input + input.body.password_input,
      10,
    ),
    style: {
      color: "aliceblue",
      bgcolor: "gray",
    },
    description: "none",
    friends: [],
  });
  const user_find = await User.findOne({ email: input.body.email_input });
  if (
    input.body.email_input != "" &&
    input.body.password_input != "" &&
    !user_find
  ) {
    await data.save();
    output.redirect("/user-login-start");
  } else if (user_find) {
    output.render("user-data-get", {
      status: "register-error",
      error_messeage: "email sudah ditemukan",
    });
  } else {
    output.render("user-data-get", {
      status: "register-error",
      error_messeage: "email dan password wajib ada",
    });
  }
});

http.get("/user-login-start", (input, output) => {
  output.render("user-data-get", {
    status: "user-login",
  });
});

http.post("/user-login-process", async function (input, output) {
  const data_input = {
    email: input.body.email_input,
    password: input.body.password_input,
  };

  const check_email = await User.findOne({ email: data_input.email });
  const match = await bcrypt.compare(
    data_input.email + data_input.password,
    check_email.passwordHash,
  );

  if (check_email && match) {
    input.session.user = {
      id: check_email._id,
      email: check_email.email,
    };
    output.redirect("/user-home-page");
  } else if (!check_email) {
    output.render("user-data-get", {
      status: "login-error",
      error_messeage: "email belum terdaftar",
    });
  } else {
    output.render("user-data-get", {
      status: "login-error",
      error_messeage: "email dan password salah",
    });
  }
});

function UserIsLogin(input, output, next) {
  if (!input.session.user) {
    output.redirect("/user-login-start");
  } else {
    next();
  }
}

http.get("/user-home-page", UserIsLogin, async (input, output) => {
  output.render("user-page", {
    page: "user-home",
    user: await User.findOne({ email: input.session.user.email }),
    chat: {
      chat_send_private: show_chat_sender(
        "private-chat",
        input.session.user.id,
      ),
      chat_send_public: show_chat_sender("public-chat", input.session.user.id),
      chat_reciepent_private: show_chat_recipent(
        "private-chat",
        input.session.user.id,
      ),
      chat_reciepent_public: show_chat_recipent(
        "public-chat",
        input.session.user.id,
      ),
    },
  });
});

http.get("/user-setting", UserIsLogin, async (input, output) => {
  output.render("user-page", {
    page: "user-setting-page",
    user: await User.findOne({ email: input.session.user.email }),
  });
});

http.post("/user-username-update", async function (input, output) {
  const user_data = {
    user_id: input.body.user_id,
    username: input.body.username_input,
  };

  await User.findByIdAndUpdate(user_data.user_id, {
    username: user_data.username,
  });
  output.redirect("/user-setting");
});

http.post("/change-user-style", async function (input, output) {
  const user_data = {
    ip_address: input.body.user_id,
    style: {
      color: input.body.color_input,
      bgcolor: input.body.bgcolor_input,
    },
  };
  await User.findByIdAndUpdate(user_data.ip_address, {
    style: user_data.style,
  });
  output.redirect("/user-setting");
});

http.get("/user-navigation-person", UserIsLogin, async (input, output) => {
  output.render("beranda-page", {
    page: "person-beranda",
    user: await User.findOne({ email: input.session.user.email }),
    person: await User.find({ email: { $ne: input.session.user.email } }),
  });
});

http.post("/search-person", UserIsLogin, async (input, output) => {
  output.render("beranda-page", {
    page: "person-beranda",
    user: await User.findOne({ email: input.session.user.email }),
    person: await User.find({ username: input.body.search_input }),
  });
});

http.post("/chat-sending-process", async function (input, output) {
  await chat_sending({
    sender: { id: input.body.user_id, name: input.body.user_name },
    reciepent: { id: input.body.reciepent_id, name: input.body.reciepent_name },
    chat_information: {
      date: `${day.d}-${day.m}-${day.y}`,
      _id: `${input.body.user_id}${input.body.reciepent_id}${day.d}${day.m}${day.y}${input.body.chat_value}`,
      chat_type: input.body.chat_type,
    },
    chat_list: [
      {
        address: input.body.user_email,
        name: input.body.user_name,
        value: input.body.chat_value,
      },
    ],
  });

  output.redirect("/user-home-page");
});

http.get("/chat-open/:chat_id/:status", UserIsLogin, async (input, output) => {
  if (input.params.status == "sender") {
    output.render("chat-page", {
      chat: chat_data(input.params.chat_id),
      user: await User.findOne({ email: input.session.user.email }),
      reciepent: await User.findById(
        chat_data(input.params.chat_id).reciepent.id,
      ),
      chat_list: chat_data(input.params.chat_id).chat_list,
      status: input.params.status,
    });
  } else {
    output.render("chat-page", {
      chat: chat_data(input.params.chat_id),
      user: await User.findOne({ email: input.session.user.email }),
      reciepent: await User.findById(chat_data(input.params.chat_id).sender.id),
      chat_list: chat_data(input.params.chat_id).chat_list,
      status: input.params.status,
    });
  }
});

http.post("/chat-send", async function (input, output) {
  chat_Sending(input.body.chat_id, {
    address: input.body.user_email,
    name: input.body.user_name,
    value: input.body.chat_value,
  });

  output.redirect(`/chat-open/${input.body.chat_id}/${input.body.user_status}`);
});

http.post("/chat-delete", function (input, output) {
  chat_delete(input.body.chat_id);

  output.redirect("/user-home-page");
});

http.post("/add-user-friends", async function (input, output) {
  const user_get = await User.findOne({ email: input.body.user_email });
  const friends_get = await User.findOne({ email: input.body.friends_email });

  await User.findByIdAndUpdate(
    friends_get._id,
    {
      $push: {
        friends: { email: user_get.email, username: user_get.username },
      },
    },
    { new: true },
  );

  await chat_sending({
    sender: { id: user_get._id, name: user_get.username },
    reciepent: { id: friends_get._id, name: friends_get.username },
    chat_information: {
      date: `${day.d}-${day.m}-${day.y}`,
      _id: `${user_get._id}${friends_get._id}${day.d}${day.m}${day.y}friendsRequest`,
      chat_type: "friends-request",
    },
    chat_list: [
      {
        address: user_get.email,
        name: user_get.username,
        value: input.body.chat_value,
      },
    ],
  });

  output.redirect("/user-friends-page");
});

http.post("/user-accept-friends", async function (input, output) {
  const user_get = await User.findById(input.body.user_id);
  const friends_get = await User.findById(input.body.friends_id);

  await User.findByIdAndUpdate(
    friends_get._id,
    {
      $push: {
        friends: { email: user_get.email, username: user_get.username },
      },
    },
    { new: true },
  );

  output.redirect("/user-friends-page");
});

http.post('/user-reject-friends',async function(input,output){
  const user=await User.findById(input.body.user_id)
  const friends=await User.findById(input.body.friends_id)
  
  await User.updateOne(
    {_id:user._id},
    {$pull:{friends:{email:friends.email}}}
  )
 output.redirect('/user-friends-page')
})

http.post("/user-logout", (input, output) => {
  input.session.destroy((err) => {
    if (err) return output.redirect("/user-home-page");

    output.redirect("/user-login-start");
  });
});

http.listen(port, () => {
  console.log("server berjalan diport" + port);
});
