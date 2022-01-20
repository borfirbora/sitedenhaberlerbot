# Siteden Haberler Bot

Telegram için geliştirilmiş **RSS FEED** botu.

## Kurulum

1. `@botfather` ile konuşarak telegram botu oluşturunuz ve jetonunuzu elde ediniz;
2. Oluşturduğunuz klasörde  
`git clone https://github.com/borfirbora/sitedenhaberlerbot.git`  
komutunu girerek projeyi indiriniz;
3. Proje klasörüne giriniz ve `.env` dosyası oluşturunuz;
4. `.env` dosyasının içine   
`BOTAPI="bot_jetonunuz"`  
ve  
`CLEARDB_DATABASE_URL:="mysql_connection_string"`
şeklinde iki değişken oluşturunuz..;
5. Ardından aşağıdaki komutları giriniz ve botunuzla etkileşimde bulununuz:

```
npm install
npm start
```

## Kullanım

Botu başarılı bir şekilde çağırdığınızda  
`/yardım`  
komutunu girerek botunuzla kullanacağınız komutları öğrenebilirsiniz.

## Bilinen Sorunlar

1. Botu tek başına kullanmamalısınız. Mutlaka bir gruba eklemelisiniz.
2. Botu tek bir grup için kullanınız. Eğer aynı RSS ve FEED adresleriyle birden çok grupta kullanmaya kalkarsanız bot hata verecek ve RSS çakışması yaşayacaktır.
3. Botu Heroku üzerinde Deploy ederken, mutlaka bir CRON-JOB çözümüne başvurunuz.

## Destek

- [Bora FIRLANGEÇ](https://github.com/borfirbora)
- <borafirlangec@gmail.com>
- <https://borfirbora.com>