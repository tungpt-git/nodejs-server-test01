import express from "express";
import dotenv from "dotenv";
import videosRoutes from "./src/api/routes/videos.js";

const PORT = process.env.PORT || 8080;
const app = express();
dotenv.config();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/videos", videosRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello ReactJs",
  });
});

app.post("/post", (req, res) => {
  console.log(req.body);
  console.log("Connected to React");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
