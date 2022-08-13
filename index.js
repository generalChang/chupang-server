const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/key");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const port = 5000;

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", require("./routes/user"));
app.use("/api/product", require("./routes/product"));
app.use("/api/comment", require("./routes/comment"));

app.listen(port, () => {
  console.log(`server listening on ${port} port`);
});
