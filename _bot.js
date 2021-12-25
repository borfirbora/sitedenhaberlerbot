const rssFeedEmitter = require("rss-feed-emitter");
require("dotenv").config();
const { Telegraf, Telegram } = require("telegraf");

const bot = new Telegraf(process.env.BOTAPI);
bot.start(context => context.reply("selaaam!"));
bot.command("bilgi", (context) => context.reply("Bu bot, yakında RSS güncellemelerinde sizi uyaracak. Hazırlıklı olun!"));
bot.command("youtubeekle", (youtube) => {
    const youtubeMSG = youtube.message.text.split(" ");
    youtubeMSG.shift();
const youtubeFeed = new rssFeedEmitter({skipFirstLoad: true});
youtubeFeed.add({
    url: youtubeMSG[0],
    refresh: 2000
})
youtube.reply(`Youtube feed adresiniz (${youtubeMSG[0]}) inceleniyor. Eğer RSS beslemenizde (FEED) hata varsa, bunu size bildireceğiz. Eğer hiç bir hata almıyorsanız, RSS beslemeniz başarılı bir şekilde eklenmiş demektir.`)
youtubeFeed.on("error",()=>{
    console.error();
    youtube.reply("Görünüşe göre RSS hatalı. Lütfen tekrar kontrol eder misiniz?")
    youtubeFeed.remove(youtubeMSG[0])
    })
youtubeFeed.on("new-item",(itemm)=>{
    youtube.reply(itemm.author+" kanalında, "+itemm["media:group"]["media:title"]["#"]+" yayınlandı!\nAçıklaması da şöyle:\n"+itemm["media:group"]["media:description"]["#"]+"\nİzlemek için: "+itemm.link);
});
});

bot.command("siteekle",(site)=>{
    const siteMSG = site.message.text.split(" ");
    siteMSG.shift();


const siteFeed = new rssFeedEmitter({skipFirstLoad: true})
siteFeed.add({
    url: siteMSG[0],
    refresh: 2000
})
site.reply(`Site feed adresiniz (${siteMSG[0]}) inceleniyor. Eğer RSS beslemenizde (FEED) hata varsa, bunu size bildireceğiz. Eğer hiç bir hata almıyorsanız, RSS beslemeniz başarılı bir şekilde eklenmiş demektir.`)
siteFeed.on("error",()=>{
    console.error();
    site.reply("Görünüşe göre RSS hatalı. Lütfen tekrar kontrol eder misiniz?")
    siteFeed.remove(siteMSG[0])
    })
siteFeed.on("new-item",(sitem)=>{
    site.reply(sitem.meta.title+", "+sitem.title+" adlı yeni bir makale yayımladı!\nAçıklaması şöyle:\n"+
    sitem["rss:description"]["#"]+"\nDevamı şurada: "+sitem.link)
})
})

bot.command("goster",(goster)=>{
    console.log(goster.getChatAdministrators())
    goster.reply(goster.message.from.toString())
})

bot.launch();