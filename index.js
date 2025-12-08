const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const port = 3000;

// Kết nối CSDL
mongoose.connect(process.env.DATABASE);

const Tour = mongoose.model(
  "Tour",
  {
    name: String,
    vehicle: String,
  },
  "tours"
);

// Thiết lập thư mục view
app.set("views", path.join(__dirname, "views"));

// Thiết lập thư mục chứa template engine
app.set("view engine", "pug");

// Thiết lập thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
  });
});

app.get("/tours", async (req, res) => {
  const tourList = await Tour.find({});

  res.render("client/pages/tour-list", {
    pageTitle: "Trang danh sách tour",
    tourList: tourList,
  });
});

app.listen(port, () => {
  console.log(`Website đang chạy ở cổng ${port}`);
});
