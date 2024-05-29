require("dotenv").config();
const express = require("express");
const cors = require("cors");
const truecallerjs = require("truecallerjs");
const whoiser = require("whoiser");
const oui = require("oui");
const lookup = require("dnsbl-lookup");
const verifier = require("email-verify");
const infoCodes = verifier.verifyCodes;
const jwt = require("jsonwebtoken");
const compression = require("compression");
const firebaseAuth = require("firebase-admin");
const credentials = require("./firebase-credentials.json");
const { auth } = require("./firebase2.js");
const { signInWithEmailAndPassword } = require("firebase/auth");
const winston = require("winston");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

//Glabal variables
const app = express();

let TOKEN;

const openai_config = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(openai_config);

firebaseAuth.initializeApp({
  credential: firebaseAuth.credential.cert(credentials),
});

const ALLOWED_ORIGIN = process.env.REACT_APP_LOCAL_API;
const PORT = process.env.PORT || 5005;

let Imap = require("imap"),
  inspect = require("util").inspect;

const LOG_PATH = "/var/log/email-tester/connection.log";

const LOGGER = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: LOG_PATH }),
  ],
});

//express
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// secure server
// const ssl = {
//   key: fs.readFileSync(
//     "/etc/letsencrypt/live/christianmacarthur.com/privkey.pem"
//   ),
//   cert: fs.readFileSync(
//     "/etc/letsencrypt/live/christianmacarthur.com/cert.pem"
//   ),
//   ca: fs.readFileSync("/etc/letsencrypt/live/christianmacarthur.com/chain.pem"),
// };

// https.createServer(ssl, app).listen(PORT, () => {
//   LOGGER.info(`Secure server running on port ${PORT}...`);
// });

//unsecure server
try {
  app.listen(PORT, () => LOGGER.info(`Backend on port ${PORT}...`));
} catch (e) {
  LOGGER.error(
    "An error ocurred with the server. Read the error log for more details.",
    e.message
  );
}

//Functions
function sendResponse(res, status, text, err) {
  !res.headersSent &&
    (console.log("Sending response:", text + (err ? " " + err : "")),
    res.status(status).json(text + (err ? " " + err : "")));
}

function sanitizeDomain(domain) {
  domain = domain.trim();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/\/.*$/, "");
  domain = domain.replace(/^(www\.)?/i, "");
  domain = domain.replace(/[^a-z0-9.\-]/gi, "");
  domain = domain.toLowerCase();
  return domain;
}

function sanitizePhoneNumber(phoneNumber) {
  phoneNumber = phoneNumber.replace(/\D/g, "");
  phoneNumber = phoneNumber.replace(/^1/, "");
  if (phoneNumber.length !== 9) {
    throw new Error("Invalid phone number");
  }
  return phoneNumber;
}

function sanitizeEmail(email) {
  email = email.trim();
  email = email.replace(/^(mailto:)?/i, "");
  email = email.replace(/[^a-z0-9@.\-]/gi, "");
  email = email.toLowerCase();

  return email;
}

function timeoutMiddleware(req, res, next) {
  const timer = 3600;

  let responseSent = false;
  const timeoutTimer = setTimeout(() => {
    if (!responseSent) {
      responseSent = true;
      return res.json("Timeout");
    }
  }, timer);

  const originalJson = res.json;
  res.json = function (data) {
    if (!responseSent) {
      responseSent = true;
      clearTimeout(timeoutTimer);
      originalJson.call(res, data);
    }
  };

  next();
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (TOKEN === null) return res.json("Access denied, Log in first");

  jwt.verify(
    TOKEN || authHeader,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.json("Token is invalid, Log in.");
      req.user = user;
      next();
    }
  );
};

const testToken = (res) => {
  axios
    .get("http://email.christianmacarthur/api/testtoken", {
      headers: {
        authorization: TOKEN,
      },
    })
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      LOGGER.error(error);
      return res.status(403).json("Token is invalid");
    });
};

//endpoints
app.use(timeoutMiddleware);

app.get("/api/test", (req, res) => {
  res.json("Hello World");
});

app.get("/api/testFirebase", (req, res) => {
  res.json(auth.currentUser);
});

app.get("/api/token", (req, res) => {
  testToken(res);
});

app.get("/api/ai", async (req, res) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hi gpt3, how are you?",
      maxTokens: 100,
      temperature: 0.5,
    });
    res.json({ reply: response });
  } catch (e) {
    LOGGER.error(e.message);
  }
});

app.get("/api/getCounters", (req, res) => {
  const db2 = firebaseAuth.firestore();

  db2
    .collection("countTests")
    .get()
    .then((querySnapshot) => {
      const counters = [];
      querySnapshot.forEach((doc) => {
        res.json(doc.data().email);
      });
    })
    .catch((error) => {
      res.json("Error getting documents: " + error);
    });
});

app.get("/api/testToken", authenticateToken, (req, res) => {
  res.json("Token is valid");
});

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body || {
    email: "christian@gmail.com",
    password: "christian",
  };

  try {
    const userResponse = await firebaseAuth.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
      disabled: false,
    });
    return res.status(200).json(userResponse);
  } catch (e) {
    LOGGER.error(e);
    return res.status(500).json(e.message);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {
    email: "informapa@clubnet.mz",
    password: "Informapa2023#",
  };

  const isLoggedIn = auth.currentUser;
  if (isLoggedIn) {
    return res.json({ accessToken: TOKEN });
  }

  try {
    const login = await signInWithEmailAndPassword(auth, email, password);

    if (login) {
      const options = {
        expiresIn: "10m",
      };

      const accessToken = jwt.sign(
        { email, password },
        process.env.ACCESS_TOKEN_SECRET,
        options
      );
      TOKEN = accessToken;
      return res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.get("/api/resetTestsCounter", (req, res) => {
  res.json("Counter reset");
});

app.get("/api/getEmails", (req, res) => {
  let imap = new Imap({
    user: "christian.macarthur@clubnet.mz",
    password: "111abcABC#",
    host: "mail.clubnet.mz",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  imap.connect();
  function openInbox(cb) {
    try {
      imap.openBox("Inbox", false, cb);
    } catch (err) {
      LOGGER.error("Erro chamando a funcão openBox()");
    }
  }

  imap.once("ready", function () {
    openInbox(function (err, box) {
      if (err) throw err;
      imap.search(
        [["HEADER", "SUBJECT", "Some Subject"]],
        function (err, results) {
          if (err) throw err;
          try {
            // let f = imap.fetch(results, { bodies: "TEXT" });
            let f = imap.seq.fetch(box.messages.total + ":*", {
              // bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
              bodies: "TEXT",
              struct: true,
            });
            // let f = imap.seq.fetch(box.messages.total + ":*", {
            //   bodies: ["HEADER.FIELDS (FROM)", "TEXT"],
            // });
            f.on("message", function (msg, seqno) {
              msg.on("body", function (stream, info) {
                let buffer = "";
                stream.on("data", function (chunk) {
                  buffer += chunk.toString();
                  try {
                    res.json(buffer);
                    LOGGER.info(buffer);
                  } catch (err) {
                    LOGGER.error("Erro while fetching emails", err);
                  }
                });
                stream.once("end", function () {
                  msg.once("attributes", function (attrs) {
                    let uid = attrs.uid;
                    imap.addFlags(uid, ["\\Seen"], function (err) {
                      if (err) {
                        LOGGER.error(err);
                      } else {
                        LOGGER.info("Marked as read!`");
                      }
                    });
                  });
                });
              });
            });
            f.once("end", function () {
              imap.end();
            });
          } catch (errorWhileFetching) {
            res.json(errorWhileFetching.message);
            LOGGER.error(errorWhileFetching.message);
            imap.end();
          }
        }
      );
    });
  });
});

app.post("/api/getDomainInfo", async (req, res) => {
  const { contact } = req.body || "";
  try {
    let domain = sanitizeDomain(JSON.stringify(contact) || "");
    LOGGER.info("checking the info for this domain: ", domain, "...");

    try {
      const domainInfo = await whoiser(domain);
      try {
        sendResponse(res, 200, domainInfo["whois.nic.mz"]["Registrant Name"]);
      } catch (e) {
        sendResponse(
          res,
          200,
          domainInfo["whois.verisign-grs.com"]["Domain Name"]
        );
      }
    } catch (e) {
      sendResponse(res, 500, "Error while testing this domain", e.message);
    }
  } catch (e) {
    sendResponse(res, 404, "Invalid Domain", e.message);
  }
});

app.post("/api/getMacInfo", async (req, res) => {
  const { contact } = req.body || "";
  LOGGER.info("Getting info about : ", contact, "...");

  try {
    const result = oui(contact);
    if (result) {
      LOGGER.info(oui(contact));
      res.status(200).json(oui(contact).split(" ")[0]);
    } else {
      res.status(200).json("No data associated with this device");
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error while getting Mac info", result: "error" });
    LOGGER.error(e.message);
  }
});

app.post("/api/getListings", async (req, res) => {
  const { contact } = req.body || "";
  let domain = sanitizeDomain(JSON.stringify(contact) || "");

  try {
    let dnsbl = new lookup.dnsbl(domain);
    let blacklistsCounter = [];
    let testCounter = 0;

    dnsbl.on("error", function (error, blocklist) {
      LOGGER.error(error);
      // return res.status(501).json("Internal error");
    });

    await dnsbl.on("data", function (result, blocklist) {
      testCounter++;
      LOGGER.info(result.status + " in " + blocklist.zone);
    });

    dnsbl.on("done", function () {
      testCounter++;
      return res.json(
        "Ran " +
          testCounter +
          " tests || " +
          "Blacklisted on " +
          blacklistsCounter.length +
          " lists || \n " +
          JSON.stringify(blacklistsCounter).replace("[", "").replace("]", "")
      );
    });
  } catch (e) {
    LOGGER.error(e.message);
    res
      .status(500)
      .json({ message: "Error while getting listing", result: "error" });
  }
});

app.post("/api/testEmail", async (req, res) => {
  const { contact } = req.body;
  LOGGER.info("testing", contact, "...");
  console.log("testing ... " + contact);
  try {
    await verifier.verify(contact, function (err, info) {
      if (info.success) {
        sendResponse(res, 200, "The email is valid");
        LOGGER.info("Terminating, Success (T/F): " + info.success);
      } else {
        let result = [];
        if (info.code === infoCodes.finishedVerification) {
          result.push(": Email not found");
        }
        if (info.code === infoCodes.invalidEmailStructure) {
          result.push(": Invalid structure");
        }
        if (info.code === infoCodes.domainNotFound) {
          result.push(": Domain not found");
        }
        if (info.code === infoCodes.noMxRecords) {
          result.push(": No MX Records for this domain");
        }
        if (info.code === infoCodes.SMTPConnectionTimeout) {
          result.push(": SMTP connection timeout");
        }
        sendResponse(
          res,
          200,
          "Invalid email",
          result !== "" ? result : ": User not found" || info.code
        );
      }
    });
  } catch (e) {
    sendResponse(res, 500, "An error occurred: " + e.message);
    LOGGER.error(e.message);
  }
});

app.post("/api/testEmailList", async (req, res) => {
  const contact = JSON.stringify(req.body) || "";
  const email = contact
    .replace("{", "")
    .replace("}", "")
    .replace('"', "")
    .replace(":", "")
    .replace(" ", "")
    .replace(";", "")
    .replace("\n", "")
    .replace("\r", "")
    .replace('"', "")
    .replace(/"/g, "")
    .trim();
  LOGGER.info("testing", email, "...");
  try {
    await verifier.verify(email, function (err, info) {
      if (info.success) {
        sendResponse(res, 200, "The email is valid");
        LOGGER.info("Terminating, Success (T/F): " + info.success);
      } else {
        let result = [];
        if (info.code === infoCodes.finishedVerification) {
          result.push(": Email not found");
        }
        if (info.code === infoCodes.invalidEmailStructure) {
          result.push(": Invalid structure");
        }
        if (info.code === infoCodes.domainNotFound) {
          result.push(": Domain not found");
        }
        if (info.code === infoCodes.noMxRecords) {
          result.push(": No MX Records for this domain");
        }
        if (info.code === infoCodes.SMTPConnectionTimeout) {
          result.push(": SMTP connection timeout");
        }
        sendResponse(
          res,
          200,
          "Invalid email",
          result !== "" ? result : ": User not found" || info.code
        );
      }
    });
  } catch (e) {
    sendResponse(
      res,
      200,
      e.message ? e.message : "An error occurred" + e.message
    );
    LOGGER.error(e.message);
  }
});

app.post("/api/testNumber", async (req, res) => {
  const { contact } = req.body;
  LOGGER.info("Testing: ", contact, "...");
  try {
    const searchData = {
      number: sanitizePhoneNumber(contact),
      countryCode: "MZ",
      installationId: process.env.TRUECALLER_ID,
      output: "JSON",
    };
    const resp = await truecallerjs.searchNumber(searchData);
    console.log(searchData);
    const name = resp.data[0].name || "No registry";
    console.log(resp);
    sendResponse(res, 200, name);
  } catch (e) {
    sendResponse(res, 500, "Error while testing this number", e.message);
    LOGGER.error(e.message);
  }
});

app.post("/api/testPass", async (req, res) => {
  const email = sanitizeEmail(JSON.stringify(req.body.emailList) || "");
  let password = req.body.password || " ";
  let passString = JSON.stringify(password)
    .trim()
    .replace(":", "")
    .replace("{", "")
    .replace("}", "")
    .replace('"', "")
    .replace('"""', "")
    .replace(" ", "")
    .replace(/\s+/g, "");
  LOGGER.info("testing", passString, "...");
});

// let imap = new Imap({
//   user: email,
//   password: "111abcABC#",
//   host: "mail.clubnet.mz",
//   port: 993,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// });

// const test = () => {
//   imap.once("ready", function () {
//     res.json("Change your password!");
//   });
//   imap.once("error", function () {
//     res.json("Password was changed");
//   });
//   imap.connect();
//   process.on("uncaughtException", (err) => {
//     LOGGER.info("uncaughtException");
//     process.exit(0);
//   });
// };
// test();
