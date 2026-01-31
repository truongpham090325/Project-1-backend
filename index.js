const express = require("express");
const path = require("path");
const databaseConfig = require("./config/database.config");
const variableConfig = require("./config/variable.config");
const clientRoutes = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 3000;

// Kết nối CSDL
databaseConfig.connect();

// Thiết lập thư mục view
app.set("views", path.join(__dirname, "views"));

// Thiết lập thư mục chứa template engine
app.set("view engine", "pug");

// Thiết lập thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, "public")));

// Tạo biến toàn cục trong file PUG
app.locals.pathAdmin = variableConfig.pathAdmin;

// Cho phép gửi dữ liệu dạng json
app.use(express.json());

// Tạo biến toàn cục trong các file backend
global.pathAdmin = variableConfig.pathAdmin;

// Lấy được cookie
app.use(cookieParser());

app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy ở cổng ${port}`);
});
