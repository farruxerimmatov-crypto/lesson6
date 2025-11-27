const http = require("http");
const { malumot_oqish, malumot_yozish } = require("./fs/file-manager");
const bcrypt = require("bcryptjs");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");

const sozlamalar = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const app = http.createServer((req, res) => {
  // Register

  if (req.method === "POST" && req.url === "/register") {
    req.on("data", async (bolak) => {
      const RegisterMalumoti = JSON.parse(bolak);
      const { shaxsIsmi, elektron_Manzil, kalit } = RegisterMalumoti;

      if (!shaxsIsmi || !elektron_Manzil || !kalit) {
        res.writeHead(400, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "shaxsIsmi, elektron_Manzil, kalit talab qilinadi",
          })
        );
      }

      const Shaxs = malumot_oqish("dorilar.json");
      const topilgan_Shaxs = Shaxs.find(
        (qism) => qism.elektron_Manzil === elektron_Manzil
      );

      if (topilgan_Shaxs) {
        res.writeHead(400, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Shaxs avvaldan bor",
          })
        );
      }

      const hash = await bcrypt.hash(kalit, 12);

      Shaxs.push({
        id: v4(),
        shaxsIsmi,
        elektron_Manzil,
        kalit: hash,
        dorilar: {}
      });

      malumot_yozish("dorilar.json", Shaxs);
      res.writeHead(201, sozlamalar);
      return res.end(
        JSON.stringify({
          message: "Ro'yxatga olindi",
        })
      );
    });
  }

  // login

  if (req.method === "POST" && req.url === "/login") {
    req.on("data", async (bolak) => {
      const LOgin_malumoti = JSON.parse(bolak);
      const { elektron_Manzil, kalit } = LOgin_malumoti;

      if (!elektron_Manzil || !kalit) {
        res.writeHead(400, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "elektron_Manzil, kalit talab qilinadi",
          })
        );
      }

      const Shaxs = malumot_oqish("dorilar.json");
      const topilgan_Shaxs = Shaxs.find(
        (inson) => inson.elektron_Manzil === elektron_Manzil
      );

      if (!topilgan_Shaxs) {
        res.writeHead(401, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Foydalanuvchi topilmadi",
          })
        );
      }

      const decode = await bcrypt.compare(kalit, topilgan_Shaxs.kalit);

      if (decode) {
        const payload = {
          id: topilgan_Shaxs.id,
          shaxsIsmi: topilgan_Shaxs.shaxsIsmi,
        };
        const access_token = jwt.sign(payload, "Salom", { expiresIn: "15m" });

        res.writeHead(200, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Success",
            access_token,
          })
        );
      } else {
        res.writeHead(401, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Kalit topilmadi",
          })
        );
      }
    });
  }

  // login_add

  if (req.method === "POST" && req.url === "/login_add") {
    req.on("data", async (bolak) => {
      const LOgin_malumoti = JSON.parse(bolak);
  
    console.log(LOgin_malumoti);
    
      const { elektron_Manzil, kalit, dorilar } = LOgin_malumoti;

      if (!elektron_Manzil || !kalit) {
        res.writeHead(400, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "elektron_Manzil, kalit talab qilinadi",
          })
        );
      }

      const Shaxs = malumot_oqish("dorilar.json");
      const topilgan_Shaxs = Shaxs.find(
        (inson) => inson.elektron_Manzil === elektron_Manzil
      );

      if (!topilgan_Shaxs) {
        res.writeHead(401, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Foydalanuvchi topilmadi",
          })
        );
      }

      const decode = await bcrypt.compare(kalit, topilgan_Shaxs.kalit);

      if (!decode) {
        res.writeHead(401, sozlamalar);
        return res.end(
          JSON.stringify({
            message: "Kalit topilmadi",
          })
        );
      }

      if (dorilar && typeof dorilar === "object") {
        if (!topilgan_Shaxs) {
          topilgan_Shaxs.dorilar = {};
        }

        for (const nom in dorilar) {
          topilgan_Shaxs.dorilar[nom] = dorilar[nom];
        }

        malumot_yozish("dorilar.json", Shaxs);
      }

      const payload = {
        id: topilgan_Shaxs.id,
        shaxsIsmi: topilgan_Shaxs.shaxsIsmi,
      };
      const access_token = jwt.sign(payload, "Salom", { expiresIn: "15m" });

      res.writeHead(200, sozlamalar);
      return res.end(
        JSON.stringify({
          message: "Success",
          access_token,
        })
      );
    });
  }

    // login_put

if (req.method === "PUT" && req.url === "/login_put") {
  req.on("data", async (bolak) => {
    const malumot = JSON.parse(bolak);
    const { elektron_Manzil, kalit, doriNomi, doriMalumot } = malumot;

    if (!elektron_Manzil || !kalit || !doriNomi || !doriMalumot) {
      res.writeHead(400, sozlamalar);
      return res.end(
        JSON.stringify({
          message:
            "elektron_Manzil, kalit, doriNomi va doriMalumot talab qilinadi",
        })
      );
    }

    const shaxslar = malumot_oqish("dorilar.json");
    const topilgan_Shaxs = shaxslar.find(
      (inson) => inson.elektron_Manzil === elektron_Manzil
    );

    if (!topilgan_Shaxs) {
      res.writeHead(404, sozlamalar);
      return res.end(JSON.stringify({ message: "Foydalanuvchi topilmadi" }));
    }

    const decode = await bcrypt.compare(kalit, topilgan_Shaxs.kalit);

    if (!decode) {
      res.writeHead(401, sozlamalar);
      return res.end(JSON.stringify({ message: "Kalit noto‘g‘ri" }));
    }

    if (!topilgan_Shaxs.dorilar) topilgan_Shaxs.dorilar = {};

    topilgan_Shaxs.dorilar[doriNomi] = doriMalumot;

    malumot_yozish("dorilar.json", shaxslar);

    res.writeHead(200, sozlamalar);
    return res.end(
      JSON.stringify({
        message: "Dori yangilandi",
        dorilar: topilgan_Shaxs.dorilar,
      })
    );
  });
}

// login dorini ochir

if (req.method === "DELETE" && req.url === "/login_dorini_ochir") {
  req.on("data", async (bolak) => {
    const malumot = JSON.parse(bolak);
    const { elektron_Manzil, kalit, doriNomi } = malumot;

    if (!elektron_Manzil || !kalit || !doriNomi) {
      res.writeHead(400, sozlamalar);
      return res.end(
        JSON.stringify({
          message: "elektron_Manzil, kalit va doriNomi talab qilinadi",
        })
      );
    }

    const shaxslar = malumot_oqish("dorilar.json");
    const topilgan_Shaxs = shaxslar.find(
      (inson) => inson.elektron_Manzil === elektron_Manzil
    );

    if (!topilgan_Shaxs) {
      res.writeHead(404, sozlamalar);
      return res.end(JSON.stringify({ message: "Foydalanuvchi topilmadi" }));
    }

    const decode = await bcrypt.compare(kalit, topilgan_Shaxs.kalit);

    if (!decode) {
      res.writeHead(401, sozlamalar);
      return res.end(JSON.stringify({ message: "Kalit noto‘g‘ri" }));
    }

    if (!topilgan_Shaxs.dorilar || !topilgan_Shaxs.dorilar[doriNomi]) {
      res.writeHead(404, sozlamalar);
      return res.end(
        JSON.stringify({ message: "Bu nomdagi dori mavjud emas" })
      );
    }

    delete topilgan_Shaxs.dorilar[doriNomi];

    malumot_yozish("dorilar.json", shaxslar);

    res.writeHead(200, sozlamalar);
    return res.end(
      JSON.stringify({
        message: "Dori o‘chirildi",
        qolganDorilar: topilgan_Shaxs.dorilar,
      })
    );
  });
}


});

app.listen(3001, () => {
  console.log("Server ishlayapti");
});
