const rssEmitter = require("rss-feed-emitter");
const feet = new rssEmitter({skipFirstLoad: false});

feet.add({
url: "https://borfirbora.com/feed.xml",
refresh: 2000
});

feet.on("error",console.error);

feet.on("new-item",item=>{
    console.log(item.meta.title+", "+item.title+" adlı yeni bir makale yayımladı!\nAçıklaması şöyle:\n"+item["rss:description"]["#"]+"\nDevamı şurada: "+item.link);
});