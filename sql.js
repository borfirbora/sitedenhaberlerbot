require("dotenv").config()
const sql = require("mysql")
const vt = sql.createConnection(process.env.DBURI)

vt.connect((err) => {
    if (err) {
        console.log(err)
    }
    console.log("bağlı...")
})

vt.query("CREATE TABLE IF NOT EXISTS `feeds` (    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,    `chat_id` int(100) NOT NULL,    `from_id` int(100) NOT NULL,    `feed_type` enum('youtube','site') NOT NULL,    `feed_url` longtext NOT NULL,    PRIMARY KEY (`id`)  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",(err,rows,fields)=>{
console.log(rows)
})

