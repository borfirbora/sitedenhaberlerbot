require("dotenv").config();
const mysql = require("mysql");
const http = require("http")
const tBot = require("node-telegram-bot-api");
const rssEmitter = require("rss-feed-emitter");
const bot = new tBot(process.env.BOTAPI, { polling: true })
const siteFeed = new rssEmitter({ skipFirstLoad: true, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36" }).setMaxListeners(0)
const youtubeFeed = new rssEmitter({ skipFirstLoad: true, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36" }).setMaxListeners(0);
const db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL:)
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL bağlantısı başarılı...")
})

bot.onText(/\/start/, (msg, match) => {
  bot.deleteMessage(msg.chat.id, msg.message_id)
  bot.sendMessage(msg.chat.id, 'Merhabalar!\nBu bot, eklediğiniz <b>RSS</b> adreslerini izleyerek, güncellemeleri sizlere bildirmek üzere tasarlanmıştır. Bot komutlarını incelemek için <b>/yardım</b> komutunu girebilirsiniz.\nUnutmayın!\nKomutları girebilmek için, <b>Grup Sahibi ya da Yöneticisi</b> olmanız gerekiyor. Aksi taktirde komutlar dikkate alınmayacaktır.', { parse_mode: "HTML" })
})

bot.onText(/\/yardım/, (msg, match) => {
  bot.deleteMessage(msg.chat.id, msg.message_id)
  bot.sendMessage(msg.chat.id, "Yardım'a hoşgeldiniz!\n\nAşağıda, botunuza ait tüm komutların bir listesi yer alıyor. Açıklamalar doğrultusunda tüm komutları kullanabilirsiniz. İşte komutların tam listesi:\n<code>/yardım</code>: Şu an okumakta olduğunuz metni görüntüler.\n<code>/youtube ekle [Youtube RSS URL'si]</code>: Botunuzun güncellemeleri bildirmesini istediğiniz Youtube RSS adresini bu komut ile gönderirseniz, botunuz istediğiniz kanalı takibe alabilir. Lütfen listenin sonundaki uyarılara dikkat edin.\n<code>/youtube kaldır [Youtube RSS URL'si]</code>: Daha önceden eklediğiniz RSS adresini kaldırmak için bu komutu kullanın. RSS URL'sini doğru verdiğinizden emin olun.\n<code>/site ekle [Site RSS URL'si]</code>: Botunuzun güncellemeleri bildirmesini istediğiniz Site RSS adresini bu komut ile gönderirseniz, botunuz istediğiniz siteyi takibe alabilir. Lütfen listenin sonundaki uyarılara dikkat edin.\n<code>/site kaldır [Site RSS URL'si]</code>: Daha önceden eklediğiniz RSS adresini kaldırmak için bu komutu kullanın. RSS URL'sini doğru verdiğinizden emin olun.\n\nUyarılar\n\n1. Eklemek istediğiniz Youtube ya da Site RSS adresinin, geçerli bir XML belgesini işaret ettiğini doğrulayın. Bunu yapabilmek için, URL'yi eklemeden önce tarayıcınıza yapıştırıp, açılan belgenin XML kodları içerdiğini kontrol edin. Eğer belge geçerli bir XML belgesi değilse, botumuz triplenebilir, haberiniz olsun.\n2. Yukarıda anlattığımız bütün kodların kabul edilebilmesi için, komutları gönderen kişinin kanalda yönetici ya da kanal sahibi olması gerekmektedir. Aksi hâlde botumuz kızıp ortalığı karıştırabilir.", { parse_mode: "HTML" })
})

bot.onText(/\/youtube ekle (.+)/, (msg, match) => {
  // yetki kontrolü yapılıyor
  bot.getChatMember(msg.chat.id, msg.from.id)
    .then((member) => {
      if (member.status === "member") {
        // komutu gönderen yönetici ya da kanal sahibi değilse?
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", yönetici değilsen, grupta herhangi bir yetkin yoksa bu işlere karışma. Bırak, yöneticiler işini yapsın.")
      } else {
        // Komutu gönderen yönetici ya da kanal sahibi ise?
        bot.sendMessage(msg.from.id, msg.from.first_name + "! Adresine bi bakçam. Sıkıntı olmazsa eklicem ama hata varsa söylerim. Unutma, hata göstermezsem, eklenmiş bil...")
        const ytEvent = msg.message_id
        // Gönderilen RSS Feed'ini tanımla ve 2000 ms süreyle takip etmesini sağla
        youtubeFeed.add({
          url: match[1],
          refresh: 60000,
          eventName: "yt" + ytEvent + "yt"
        }) // tanımlama tamamlandı
        // Feed'te hata varsa?
        youtubeFeed.on("error", (err) => {
          console.log(err)
          // bot.sendMessage(msg.from.id, msg.from.first_name + "! sen bence şu URL'yi bi incele. Sanki bu Youtube Feed URL'si değil gibi geldi bana: " + match[1])
          // youtubeFeed.remove(match[1])
        }) // hata sonu

        // Veri tabanına veri yazma başlıyor.

        const saveYoutube = mysql.createConnection(process.env.CLEARDB_DATABASE_URL:)
        saveYoutube.connect()
        saveYoutube.query("INSERT INTO `feeds` (`chat_id`, `from_id`, `feed_type`, `feed_url`)        VALUES ('" + msg.chat.id + "', '" + msg.from.id + "', 1, '" + match[1] + "');", (err, rows, fields) => {
          if (err) throw err;
        })
        saveYoutube.end()

        // new-item başlangıcı
        youtubeFeed.on("yt" + ytEvent + "yt", (item) => {
          let description = item["media:group"]["media:description"]["#"].split(".")
          description.length = 3;
          bot.sendMessage(msg.chat.id, '<b>' + item.author + '</b> kanalında yeni bir video var!\n\n<u>' + description.join(".") + '</u>\n\nİzlemek için <a href="' + item.link + '">' + item["media:group"]["media:title"]["#"] + '</a> bağlantısına dokunun!', { parse_mode: "HTML" })
        })  // new-item sonu
      } // if sonu
    }) // Then sonu

  // bütün işlemlerden sonra gönderilen komut mesajı siliniyor
  bot.deleteMessage(msg.chat.id, msg.message_id)
}) // function sonu

bot.onText(/\/site ekle (.+)/, (msg, match) => {
  // yetki kontrolü yapılıyor
  bot.getChatMember(msg.chat.id, msg.from.id)
    .then((member) => {
      if (member.status === "member") {
        // komutu gönderen yönetici ya da kanal sahibi değilse?
        bot.sendMessage(msg.from.id, msg.from.first_name + ", yönetici değilsen, grupta herhangi bir yetkin yoksa bu işlere karışma. Bırak, yöneticiler işini yapsın.")
      } else {
        // Komutu gönderen yönetici ya da kanal sahibi ise?
        bot.sendMessage(msg.from.id, msg.from.first_name + "! Adresine bi bakçam. Sıkıntı olmazsa eklicem ama hata varsa söylerim. Unutma, hata göstermezsem, eklenmiş bil...")
        const stEvent = msg.message_id
        // Gönderilen RSS Feed'ini tanımla ve 2000 ms süreyle takip etmesini sağla
        siteFeed.add({
          url: match[1],
          refresh: 60000,
          eventName: "st" + stEvent + "st"
        }) // tanımlama tamamlandı
        // Feed'te hata varsa?
        siteFeed.on("error", (err) => {
          console.log(err)
          // bot.sendMessage(msg.from.id, msg.from.first_name + "! sen bence şu URL'yi bi incele. Sanki bu Site Feed URL'si değil gibi geldi bana: " + match[1])
          // siteFeed.remove(match[1])
        }) // hata sonu

        // Veri tabanına veri yazma başlıyor.

        const saveSite = mysql.createConnection(process.env.CLEARDB_DATABASE_URL:)
        saveSite.connect()
        saveSite.query("INSERT INTO `feeds` (`chat_id`, `from_id`, `feed_type`, `feed_url`)        VALUES ('" + msg.chat.id + "', '" + msg.from.id + "', 2, '" + match[1] + "');", (err, rows, fields) => {
          if (err) throw err;
        })
        saveSite.end()


        // new-item başlangıcı
        siteFeed.on("st" + stEvent + "st", (item) => {
          let description = item["rss:description"]["#"].replace(/<[^>]+>/gm, '').split(".")
          description.length = 3;
          bot.sendMessage(msg.chat.id, '<b>' + item.meta.title + '</b> Bildiriyor!\n\n' + description + '..\n\nDevamını okumak için <a href="' + item.link + '">' + item.title + '</a> bağlantısına dokunabilirsiniz!', { parse_mode: "HTML" })
        })  // new-item sonu
      } // if sonu
    }) // Then sonu
  // bütün işlemlerden sonra gönderilen komut mesajı siliniyor
  bot.deleteMessage(msg.chat.id, msg.message_id)
}) // function sonu

bot.onText(/\/site kaldır (.+)/, (msg, match) => {
  // yetki kontrolü yapılıyor
  bot.getChatMember(msg.chat.id, msg.from.id)
    .then((member) => {
      if (member.status === "member") {
        // komutu gönderen yönetici ya da kanal sahibi değilse?
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", yönetici değilsen, grupta herhangi bir yetkin yoksa bu işlere karışma. Bırak, yöneticiler işini yapsın.")
      } else {
        // Komutu gönderen yönetici ya da kanal sahibi ise?
        bot.sendMessage(msg.from.id, msg.from.first_name + "! Adresine bi bakçam. Sıkıntı olmazsa kaldırcam ama hata varsa söylerim. Unutma, hata göstermezsem, kaldırılmış bil...")
        siteFeed.on("error", () => {
          console.error()
          bot.sendMessage(msg.from.id, msg.from.first_name + "! sen bence şu URL'yi bi incele. Sanki bu Site Feed URL'si değil gibi geldi bana.")
        }) // hata sonu

        const removeSite = mysql.createConnection(process.env.CLEARDB_DATABASE_URL:)
        removeSite.connect()
        removeSite.query("DELETE FROM `feeds` WHERE ((`feed_url` = '" + match[1] + "'));", (err, rows, fields) => {
          if (err) throw err;
        })
        removeSite.end()

        siteFeed.remove(match[1])
      } // if sonu
    }) // Then sonu

  // bütün işlemlerden sonra gönderilen komut mesajı siliniyor
  bot.deleteMessage(msg.chat.id, msg.message_id)
}) // function sonu

bot.onText(/\/youtube kaldır (.+)/, (msg, match) => {
  // yetki kontrolü yapılıyor
  bot.getChatMember(msg.chat.id, msg.from.id)
    .then((member) => {
      if (member.status === "member") {
        // komutu gönderen yönetici ya da kanal sahibi değilse?
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", yönetici değilsen, grupta herhangi bir yetkin yoksa bu işlere karışma. Bırak, yöneticiler işini yapsın.")
      } else {
        // Komutu gönderen yönetici ya da kanal sahibi ise?
        bot.sendMessage(msg.from.id, msg.from.first_name + "! Adresine bi bakçam. Sıkıntı olmazsa kaldırcam ama hata varsa söylerim. Unutma, hata göstermezsem, kaldırılmış bil...")
        youtubeFeed.on("error", () => {
          console.error()
          bot.sendMessage(msg.from.id, msg.from.first_name + "! sen bence şu URL'yi bi incele. Sanki bu Site Feed URL'si değil gibi geldi bana.")
        }) // hata sonu

        const removeYoutube = mysql.createConnection(process.env.CLEARDB_DATABASE_URL:)
        removeYoutube.connect()
        removeYoutube.query("DELETE FROM `feeds` WHERE ((`feed_url` = '" + match[1] + "'));", (err, rows, fields) => {
          if (err) throw err;
        })
        removeYoutube.end()

        youtubeFeed.remove(match[1])
      } // if sonu
    }) // Then sonu

  // bütün işlemlerden sonra gönderilen komut mesajı siliniyor
  bot.deleteMessage(msg.chat.id, msg.message_id)
}) // function sonu


// Web sunucusu oluşturuluyor ve Request geldiğinde basit bir metin gönderiyor.
const web = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
  res.end("Bot başarıyla çalışıyor...")
})

// sunucu dinlemeye başlayacak.
web.listen(process.env.PORT || 3000, () => {
  console.log("Sunucu çalışıyor...")

  // veri tabanı sorgusu kullanılarak tablo eklenecek.
  db.query("CREATE TABLE IF NOT EXISTS `feeds` (    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,    `chat_id` bigint NOT NULL,    `from_id` bigint NOT NULL,    `feed_type` enum('youtube','site') NOT NULL,    `feed_url` longtext NOT NULL,    PRIMARY KEY (`id`)  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;", (err, rows, fields) => {
    if (err) throw err;
    console.log("Feeds tablosu ekleme denemesi başarılı oldu.")
  }) // tablo ekleme sonu.

  // tablodan veriler çekilecek ve uygun listener eklemesi yapılacak.
  db.query("SELECT chat_id, from_id, feed_type, feed_url FROM `feeds`;", (err, rows, fields) => {
    if (err) throw err;
    console.log("Veriler Feeds veri tabanından başarıyla çekildi, işlemler başlıyor...")
    rows.forEach(element => {
      if (element.feed_type === "site") {
const stEvent2 = Date.now()
        siteFeed.add({
          url: element.feed_url,
          refresh: 60000,
          eventName: "st" + stEvent2 + "st"
        }) // tanımlama tamamlandı
        // Feed'te hata varsa?
        siteFeed.on("error", (err) => {
          console.log(err)
          // bot.sendMessage(element.from_id, "! sen bence şu URL'yi bi incele. Sanki bu Site Feed URL'si değil gibi geldi bana: " + element.feed_url)
          // siteFeed.remove(element.feed_url))
        }) // hata sonu
        // new-item başlangıcı
        siteFeed.on("st" + stEvent2 + "st", (item) => {
          let description = item["rss:description"]["#"].replace(/<[^>]+>/gm, '').split(".")
          description.length = 3;
          bot.sendMessage(element.chat_id, '<b>' + item.meta.title + '</b> Bildiriyor!\n\n' + description + '..\n\nDevamını okumak için <a href="' + item.link + '">' + item.title + '</a> bağlantısına dokunabilirsiniz!', { parse_mode: "HTML" })
        })  // new-item sonu
      } else {
        const ytEvent2 = Date.now()
        // Gönderilen RSS Feed'ini tanımla ve 2000 ms süreyle takip etmesini sağla
        youtubeFeed.add({
          url: element.feed_url,
          refresh: 60000,
          eventName: "yt" + ytEvent2 + "yt"
        }) // tanımlama tamamlandı
        // Feed'te hata varsa?
        youtubeFeed.on("error", (err) => {
          console.log(err)
          // bot.sendMessage(element.from_id, "! sen bence şu URL'yi bi incele. Sanki bu Youtube Feed URL'si değil gibi geldi bana: " + element.feed_url)
          // youtubeFeed.remove(element.feed_url)
        }) // hata sonu

        // new-item başlangıcı
        youtubeFeed.on("yt" + ytEvent2 + "yt", (item) => {
          let description = item["media:group"]["media:description"]["#"].split(".")
          description.length = 3;
          bot.sendMessage(element.chat_id, '<b>' + item.author + '</b> kanalında yeni bir video var!\n\n<u>' + description.join(".") + '</u>\n\nİzlemek için <a href="' + item.link + '">' + item["media:group"]["media:title"]["#"] + '</a> bağlantısına dokunun!', { parse_mode: "HTML" })
        })  // new-item sonu
      } // if sonu.
    }); // forEach sonu.
  }) // tablodan veri çekme sonu.

  // veri tabanı bağlantısı kesilecek.
  db.end((err) => {
    if (err) throw err;
    console.log("MySQL bağlantısı başarıyla kapandı...")
  }) // bağlantı kesimi sonu.
}) // listen sonu.