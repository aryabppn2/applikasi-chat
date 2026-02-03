require("dotenv").config();

const { url, chat } = require(process.env.db_config);

function chat_sending(chat_data) {
  chat.push(chat_data);
  url.writeFileSync(process.env.chat_db, JSON.stringify(chat));
}

const show_chat_sender = (chat_type, email) => {
  const chat_type_get = chat.filter(
    (data) => data.chat_information.chat_type == chat_type,
  );
  return chat_type_get.filter((data) => data.sender.email == email);
};

const show_chat_recipent = (chat_type,email) => {
  const chat_type_get = chat.filter(
    (data) => data.chat_information.chat_type == chat_type,
  );
  return chat_type_get.filter((data) => data.reciepent.email == email);
};

const chat_data = (chat_id) => {
  return chat.filter(
    (chat_data) => chat_data.chat_information._id == chat_id,
  )[0];
};

function chat_Sending(chat_id, chat_input) {
  chat
    .filter((data) => data.chat_information._id == chat_id)[0]
    .chat_list.push(chat_input);
  url.writeFileSync(process.env.chat_db, JSON.stringify(chat));
}

const chat_public_get= ()=>{
  return chat.filter(data=>data.chat_information.chat_type=="public-chat")
}

function chat_delete(chat_id) {
  const chat_delete = chat.filter(
    (data) => data.chat_information._id != chat_id,
  );
  url.writeFileSync(process.env.chat_db, JSON.stringify(chat_delete));
}

const search_chat_public=(chats,keyword_input)=>{
  return chats.filter(data=>data.chat_information.chat_title.toLowerCase().includes(keyword_input.toLowerCase()))
}

module.exports = {
  chat_sending,
  show_chat_sender,
  show_chat_recipent,
  chat_data,
  chat_Sending,
  chat_public_get,
  chat_delete,
  search_chat_public
};
