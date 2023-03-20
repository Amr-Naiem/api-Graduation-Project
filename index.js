const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const authProviderRoute = require("./routes/authProvider");
const userRoute = require("./routes/users");
const providerRoute = require("./routes/providers");
const serviceRoute = require("./routes/services");
const requestsRoute = require("./routes/requests");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(cors({
  origin:"http://localhost:3000"
}));
//app.use(express.static(__dirname + "/images"));
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify:true
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});

app.use("/auth", authRoute);
app.use("/authProvider", authProviderRoute);
app.use("/users", userRoute);
app.use("/providers", providerRoute);
app.use("/services", serviceRoute);
app.use("/requests", requestsRoute);
app.use("/categories", categoryRoute);

app.listen("5000", () => {
  console.log("Backend is running.");
});
