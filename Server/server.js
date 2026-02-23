require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("node:path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dns = require("node:dns");
const fileUpload = require("express-fileupload");
const authRoutes = require("./Routes/authRoute.js");
const homeRoutes = require("./Routes/homeroutes/homeroutes.js");
const contactRoutes = require("./Routes/contactroute/contactroute.js");
const techRoutes = require("./Routes/techRoute/techRoute.js");
const categoryRoutes = require("./Routes/techRoute/categoryRoute.js");
const queryRoutes = require("./Routes/queryroutes/queryroutes.js");
const technologyRoute = require("./Routes/technologyroutes/technologyRoute.js");
const techcategoryRoute = require("./Routes/technologyroutes/categoryRoute.js");
const blogRoutes = require("./Routes/Blogroute/categoryRoute.js");
const galleryRoutes = require("./Routes/galleryroutes/galleryroutes.js");
dns.setServers(["8.8.8.8", "1.1.1.1", "0.0.0.0"]);

const app = express();
const PORT = process.env.PORT || 8001;
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.use(express.json()); // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for form-urlencoded bodies
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });
app.use(
  fileUpload({
    useTempFiles: false,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/blogcategory", blogRoutes);
app.use("/api/technology/category", techcategoryRoute);
app.use("/api/technology/product", technologyRoute);
app.use("/tech", techRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/query", queryRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
