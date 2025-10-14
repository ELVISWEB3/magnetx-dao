"use strict";
require("dotenv").config();
const app = require("./app");

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
