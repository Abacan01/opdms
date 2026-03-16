import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";

const app: Express = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req: any, _res, next) => {
  const raw = req.cookies?.session;
  if (raw) {
    try {
      req.session = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    } catch {
      req.session = {};
    }
  } else {
    req.session = {};
  }
  next();
});

app.use((req: any, res: any, next) => {
  const origJson = res.json.bind(res);
  res.json = (body: any) => {
    if (req.session && Object.keys(req.session).length > 0) {
      const encoded = Buffer.from(JSON.stringify(req.session)).toString("base64");
      res.cookie("session", encoded, { httpOnly: true, sameSite: "lax" });
    } else if (req.session !== undefined && Object.keys(req.session).length === 0 && req.cookies?.session) {
      res.clearCookie("session");
    }
    return origJson(body);
  };
  next();
});

app.use("/api", router);

export default app;
