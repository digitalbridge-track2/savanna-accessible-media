import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("apps/demo/public/lessons/digital-workplace");

// 1. WebVTT Captions for all 5 languages
const vttOM = `WEBVTT - Dandeettii Bakka Hojii Diijitaalaa (Afaan Oromoo Qophaa'e)

00:00:00.000 --> 00:00:04.500
Baga gara leenjii Dandeettii Bakka Hojii Diijitaalaa bu'uuraatti nagaan dhuftan.

00:00:04.500 --> 00:00:09.000
Barnoota kana keessatti qunnamtii yerootiin hin daangeffamne fi sanadoota hundaaf mijatan ilaalla.

00:00:09.000 --> 00:00:14.200
Gareewwan faffaca'an keessatti yeroo hojjatamu, mata-dureewwan sirreeffaman fi barreeffamoonni suuraa ibsan baay'ee barbaachisoodha.

00:00:14.200 --> 00:00:19.500
Gara gadii mirgaatti qabduun iyyannoo galchuu akkamitti akka ifee mul'atu qalbeeffadhaa.

00:00:19.500 --> 00:00:25.000
Namni hundi barnootaa fi bakka hojiitti meeshaalee guutummaatti hundaaf mijatan argachuuf mirga qaba.
`;

const vttTI = `WEBVTT - ናይ ዲጂታል ስራሕ ቦታ ክእለታት (ትግርኛ ዝተገምገመ)

00:00:00.000 --> 00:00:04.500
እንቋዕ ናብ መሰረታዊ ትምህርቲ ናይ ዲጂታል ስራሕ ቦታ ክእለታት ብደሓን መጻእኹም።

00:00:04.500 --> 00:00:09.000
ኣብዚ ትምህርቲ እዚ፣ ዘይቀጥታዊ ርክብን ተበጻሒ ምድላው ሰነዳትን ክንምርምር ኢና።

00:00:09.000 --> 00:00:14.200
ኣብ ዝተፈላለዩ ጉጅለታት ክትሰርሑ ከለኹም፣ ቅርጺ ዘለዎም ኣርእስታትን መግለጺ ምስልታትን ኣዝዮም ኣገደስቲ እዮም።

00:00:14.200 --> 00:00:19.500
ኣብቲ ናይ መመልከቲ ገጽ ታሕታይ ክፋል ብየማን ዘሎ መመልከቲ መእተዊ መጎተቲ ብኸመይ ተለልዩ ከምዘሎ ኣስተውዕሉ።

00:00:19.500 --> 00:00:25.000
ነፍሲ ወከፍ ሰብ ኣብ ትምህርትን ስራሕን ምሉእ ብምሉእ ተበጻሕቲ ዝኾኑ መሳርሒታት ናይ ምርካብ መሰል ኣለዎ።
`;

const vttSO = `WEBVTT - Xirfadaha Goobta Shaqada Dijitaalka (Af-Soomaali Dib loo eegay)

00:00:00.000 --> 00:00:04.500
Ku soo dhowow Xirfadaha Goobta Shaqada Dijitaalka: Aasaaska.

00:00:04.500 --> 00:00:09.000
Casharkan, waxaan ku baari doonaa xiriirka aan tooska ahayn iyo diyaarinta dukumentiyada la heli karo.

00:00:09.000 --> 00:00:14.200
Markaad ka shaqaynayso kooxo kala fog, cinwaannada habaysan iyo qoraallada sharaxaadda sawirrada ayaa muhiim ah.

00:00:14.200 --> 00:00:19.500
U fiirso sida badhanka gudbinta ee bogga codsiga loogu iftiimiyay xagga hoose ee midigta.

00:00:19.500 --> 00:00:25.000
Qof kastaa wuxuu xaq u leeyahay qalab si buuxda loo wada heli karo xagga waxbarashada iyo shaqada.
`;

fs.writeFileSync(path.join(dir, "captions.om.vtt"), vttOM, "utf-8");
fs.writeFileSync(path.join(dir, "captions.ti.vtt"), vttTI, "utf-8");
fs.writeFileSync(path.join(dir, "captions.so.vtt"), vttSO, "utf-8");
console.log("Written captions.om.vtt, captions.ti.vtt, captions.so.vtt");

// 2. Transcripts JSON
const transcriptAM = {
  lessonId: "digital-workplace-01",
  language: "am",
  segments: [
    {
      id: 1,
      start: 0,
      end: 4.5,
      speaker: "አስተማሪ",
      text: "እንኳን ወደ ዲጂታል የሥራ ቦታ ክህሎቶች መሠረታዊ ትምህርት በደህና መጡ።",
      visualDescription: "የስላይድ አርዕስት፡ ዲጂታል የሥራ ቦታ ክህሎቶች ከአጋር አርማዎች ጋር።"
    },
    {
      id: 2,
      start: 4.5,
      end: 9.0,
      speaker: "አስተማሪ",
      text: "በዚህ ትምህርት የርቀት የሥራ ግንኙነትን እና ተደራሽ የሰነድ አዘገጃጀትን እንመለከታለን።",
      visualDescription: "የርቀት የትብብር መሣሪያዎችን እና የሰነድ አዶዎችን የሚያሳይ ዲያግራም።"
    },
    {
      id: 3,
      start: 9.0,
      end: 14.2,
      speaker: "አስተማሪ",
      text: "በተለያዩ ቡድኖች ውስጥ ሲሰሩ፣ ግልጽ ርዕሶች እና የምስል ገላጭ ጽሑፎች ወሳኝ ናቸው።",
      visualDescription: "ንጹህ የሲማንቲክ HTML አርዕስተ-ተዋረድ የሚያሳይ የኮድ ቅንጭብ።"
    },
    {
      id: 4,
      start: 14.2,
      end: 19.5,
      speaker: "አስተማሪ",
      text: "በማመልከቻው ገጽ ታችኛው ክፍል በስተቀኝ የሚገኘውን የማመልከቻ ማስገቢያ ቁልፍ ልብ ይበሉ።",
      visualDescription: "የማመልከቻ ማስገቢያ ቁልፉ በቅጹ ታችኛው ክፍል በስተቀኝ በደማቅ አረንጓዴ ቀለም ጎልቶ ይታያል።"
    },
    {
      id: 5,
      start: 19.5,
      end: 25.0,
      speaker: "አስተማሪ",
      text: "ሁሉም ሰው በትምህርት እና በሥራ ቦታ ሙሉ በሙሉ ተደራሽ የሆኑ መሣሪያዎችን የማግኘት መብት አለው።",
      visualDescription: "የመዝጊያ ባነር፡ ዲጂታል ብሪጅ — ለሁሉም ሰው የሚሰራ ነገር ይገንቡ።"
    }
  ]
};

const transcriptOM = {
  lessonId: "digital-workplace-01",
  language: "om",
  segments: [
    {
      id: 1,
      start: 0,
      end: 4.5,
      speaker: "Barsiisaa",
      text: "Baga gara leenjii Dandeettii Bakka Hojii Diijitaalaa bu'uuraatti nagaan dhuftan.",
      visualDescription: "Mata duree Islaayidii: Dandeettii Bakka Hojii Diijitaalaa asxaa qooda fudhattootaa waliin."
    },
    {
      id: 2,
      start: 4.5,
      end: 9.0,
      speaker: "Barsiisaa",
      text: "Barnoota kana keessatti qunnamtii yerootiin hin daangeffamne fi sanadoota hundaaf mijatan ilaalla.",
      visualDescription: "Diyaagiraamii meeshaalee hojii gamtaa fi asxaawwan sanadaa agarsiisu."
    },
    {
      id: 3,
      start: 9.0,
      end: 14.2,
      speaker: "Barsiisaa",
      text: "Gareewwan faffaca'an keessatti yeroo hojjatamu, mata-dureewwan sirreeffaman fi barreeffamoonni suuraa ibsan baay'ee barbaachisoodha.",
      visualDescription: "Muraa koodii tartiiba mata-dureewwan HTML siimaantiikii ifaa agarsiisu."
    },
    {
      id: 4,
      start: 14.2,
      end: 19.5,
      speaker: "Barsiisaa",
      text: "Gara gadii mirgaatti qabduun iyyannoo galchuu akkamitti akka ifee mul'atu qalbeeffadhaa.",
      visualDescription: "Qabduun Iyyannoo Galchi gadi gara mirgaatti magariisa ifaatiin mul'ata."
    },
    {
      id: 5,
      start: 19.5,
      end: 25.0,
      speaker: "Barsiisaa",
      text: "Namni hundi barnootaa fi bakka hojiitti meeshaalee guutummaatti hundaaf mijatan argachuuf mirga qaba.",
      visualDescription: "Faajjii Cufiinsaa: Diijitaal Biriij — Waan hundaaf hojjatu ijaaraa."
    }
  ]
};

const transcriptTI = {
  lessonId: "digital-workplace-01",
  language: "ti",
  segments: [
    {
      id: 1,
      start: 0,
      end: 4.5,
      speaker: "መምህር",
      text: "እንቋዕ ናብ መሰረታዊ ትምህርቲ ናይ ዲጂታል ስራሕ ቦታ ክእለታት ብደሓን መጻእኹም።",
      visualDescription: "ኣርእስቲ ስላይድ፡ ናይ ዲጂታል ስራሕ ቦታ ክእለታት ምስ ምልክት መሻርኽቲ።"
    },
    {
      id: 2,
      start: 4.5,
      end: 9.0,
      speaker: "መምህር",
      text: "ኣብዚ ትምህርቲ እዚ፣ ዘይቀጥታዊ ርክብን ተበጻሒ ምድላው ሰነዳትን ክንምርምር ኢና።",
      visualDescription: "ናይ ርሑቕ ምትሕብባር መሳርሒታትን ምልክት ሰነዳትን ዘርኢ ዲያግራም።"
    },
    {
      id: 3,
      start: 9.0,
      end: 14.2,
      speaker: "መምህር",
      text: "ኣብ ዝተፈላለዩ ጉጅለታት ክትሰርሑ ከለኹም፣ ቅርጺ ዘለዎም ኣርእስታትን መግለጺ ምስልታትን ኣዝዮም ኣገደስቲ እዮም።",
      visualDescription: "ንጹር ሲማንቲክ HTML መዋቕር ዘርኢ ቅንጣሽ ኮድ።"
    },
    {
      id: 4,
      start: 14.2,
      end: 19.5,
      speaker: "መምህር",
      text: "ኣብቲ ናይ መመልከቲ ገጽ ታሕታይ ክፋል ብየማን ዘሎ መመልከቲ መእተዊ መጎተቲ ብኸመይ ተለልዩ ከምዘሎ ኣስተውዕሉ።",
      visualDescription: "መመልከቲ መእተዊ መጠወቒ ኣብቲ ቅጥዒ ታሕታይ የማን ብደማቕ ቀጠልያ ተለልዩ ይርአ።"
    },
    {
      id: 5,
      start: 19.5,
      end: 25.0,
      speaker: "መምህር",
      text: "ነፍሲ ወከፍ ሰብ ኣብ ትምህርትን ስራሕን ምሉእ ብምሉእ ተበጻሕቲ ዝኾኑ መሳርሒታት ናይ ምርካብ መሰል ኣለዎ።",
      visualDescription: "ናይ መደምደምታ ባነር፡ ዲጂታል ብሪጅ — ንኹሉ ዝሰርሕ ንሃንጽ።"
    }
  ]
};

const transcriptSO = {
  lessonId: "digital-workplace-01",
  language: "so",
  segments: [
    {
      id: 1,
      start: 0,
      end: 4.5,
      speaker: "Macallin",
      text: "Ku soo dhowow Xirfadaha Goobta Shaqada Dijitaalka: Aasaaska.",
      visualDescription: "Cinwaanka Bogga: Xirfadaha Goobta Shaqada Dijitaalka oo ay weheliyaan astaamaha bahwadaagta."
    },
    {
      id: 2,
      start: 4.5,
      end: 9.0,
      speaker: "Macallin",
      text: "Casharkan, waxaan ku baari doonaa xiriirka aan tooska ahayn iyo diyaarinta dukumentiyada la heli karo.",
      visualDescription: "Jaantus muujinaya qalabka wada-shaqaynta fog iyo astaamaha dukumentiga."
    },
    {
      id: 3,
      start: 9.0,
      end: 14.2,
      speaker: "Macallin",
      text: "Markaad ka shaqaynayso kooxo kala fog, cinwaannada habaysan iyo qoraallada sharaxaadda sawirrada ayaa muhiim ah.",
      visualDescription: "Qayb koodh ah oo muujinaysa kala sareynta cinwaannada semantic HTML oo cad."
    },
    {
      id: 4,
      start: 14.2,
      end: 19.5,
      speaker: "Macallin",
      text: "U fiirso sida badhanka gudbinta ee bogga codsiga loogu iftiimiyay xagga hoose ee midigta.",
      visualDescription: "Badhanka Gudbi Codsiga waxaa lagu iftiimiyay cagaar dhalaalaya oo ku yaal xagga hoose ee midigta foomka."
    },
    {
      id: 5,
      start: 19.5,
      end: 25.0,
      speaker: "Macallin",
      text: "Qof kastaa wuxuu xaq u leeyahay qalab si buuxda loo wada heli karo xagga waxbarashada iyo shaqada.",
      visualDescription: "Boor xiritaanka: Buundada Dijitaalka — Dhis wax u shaqeeya qof kasta."
    }
  ]
};

fs.writeFileSync(path.join(dir, "transcript.am.json"), JSON.stringify(transcriptAM, null, 2), "utf-8");
fs.writeFileSync(path.join(dir, "transcript.om.json"), JSON.stringify(transcriptOM, null, 2), "utf-8");
fs.writeFileSync(path.join(dir, "transcript.ti.json"), JSON.stringify(transcriptTI, null, 2), "utf-8");
fs.writeFileSync(path.join(dir, "transcript.so.json"), JSON.stringify(transcriptSO, null, 2), "utf-8");
console.log("Written transcript.am.json, transcript.om.json, transcript.ti.json, transcript.so.json");

// Sync to dist, savanna, and demo
const targets = [
  path.resolve("apps/demo/dist/lessons/digital-workplace"),
  path.resolve("savanna/demo/lessons/digital-workplace"),
  path.resolve("demo/lessons/digital-workplace")
];

const files = [
  "captions.en.vtt",
  "captions.am.vtt",
  "captions.om.vtt",
  "captions.ti.vtt",
  "captions.so.vtt",
  "transcript.en.json",
  "transcript.am.json",
  "transcript.om.json",
  "transcript.ti.json",
  "transcript.so.json"
];

for (const t of targets) {
  fs.mkdirSync(t, { recursive: true });
  for (const f of files) {
    const src = path.join(dir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(t, f));
    }
  }
  console.log(`Synced caption and transcript files to ${t}`);
}
console.log("Multilingual captions and transcripts generated and synchronized successfully!");
