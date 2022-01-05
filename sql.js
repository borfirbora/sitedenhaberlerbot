require("dotenv").config()
const sql = require("mysql")
const vt = sql.createConnection(process.env.DBURI)

vt.connect((err)=>{
if(err){
    console.log(err)  
}
console.log("bağlı...")
})

vt.query("SELECT 2+2 AS islem, 4+4 AS islem2;",(err,row,field)=>{
row.forEach(element => {
    console.log(element.islem +", " + element.islem2)
});
})

vt.end()
