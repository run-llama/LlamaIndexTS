# Pamatmoduļi

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

LlamaIndex.TS piedāvā vairākus pamatmoduļus, kas ir sadalīti augsta līmeņa moduļos, lai ātri sāktu darbu, un zemā līmeņa moduļos, lai pielāgotu galvenos komponentus pēc vajadzības.

## Augsta līmeņa moduļi

- [**Dokuments**](./high_level/documents_and_nodes.md): Dokuments pārstāv teksta failu, PDF failu vai citu vienmērīgu datu gabalu.

- [**Kods**](./high_level/documents_and_nodes.md): Pamata datu būvēšanas bloks. Visbiežāk tie ir dokumenta daļas, kas ir sadalītas pārvaldāmos gabalos, kas ir pietiekami mazi, lai tos varētu padot iegultajam modelim un LLM.

- [**Lasītājs/Ielādētājs**](./high_level/data_loader.md): Lasītājs vai ielādētājs ir kas, kas ņem dokumentu reālajā pasaulē un pārveido to par Dokumenta klasi, kas pēc tam var tikt izmantota jūsu indeksā un vaicājumos. Pašlaik mēs atbalstām vienkāršus teksta failus un PDF failus, bet nākotnē plānojam atbalstīt vēl daudz vairāk formātus.

- [**Indeksi**](./high_level/data_index.md): Indeksi glabā Kodus un to iegultās vērtības.

- [**Vaicājumu dzinējs**](./high_level/query_engine.md): Vaicājumu dzinēji ir tie, kas ģenerē vaicājumu, ko ievadāt, un sniedz jums rezultātu. Vaicājumu dzinēji parasti apvieno iepriekš izveidotu norādi ar atlasītiem Kodiem no jūsu indeksa, lai dotu LLM kontekstu, kas nepieciešams, lai atbildētu uz jūsu vaicājumu.

- [**Čata dzinējs**](./high_level/chat_engine.md): Čata dzinējs palīdz jums izveidot čatbota, kas mijiedarbosies ar jūsu indeksiem.

## Zemā līmeņa modulis

- [**LLM**](./low_level/llm.md): LLM klase ir vienota saskarne pār lielu valodas modeli sniedzēju, piemēram, OpenAI GPT-4, Anthropic Claude vai Meta LLaMA. Jūs varat to apakšklasēt, lai izveidotu savienojumu ar savu lielo valodas modeli.

- [**Iegultās vērtības**](./low_level/embedding.md): Iegultā vērtība ir reprezentēta kā peldošo punktu skaitļu vektors. Mūsu noklusējuma iegultā modelis ir OpenAI teksta iegultā-ada-002, un katrā iegultajā vērtībā ir 1 536 peldošo punktu skaitļi. Vēl viens populārs iegultā modelis ir BERT, kas izmanto 768 peldošo punktu skaitļus, lai reprezentētu katru mezglu. Mēs piedāvājam vairākas utilītas, lai strādātu ar iegultajām vērtībām, ieskaitot 3 līdzības aprēķināšanas iespējas un maksimālo marginālo nozīmību.

- [**Teksta sadalītājs/Mezglu parsētājs**](./low_level/node_parser.md): Teksta sadalīšanas stratēģijas ir ļoti svarīgas iegultā meklēšanas kopējai efektivitātei. Pašlaik, lai gan mums ir noklusējuma vērtība, nav vienas izmēra risinājuma, kas derētu visiem. Atkarībā no avota dokumentiem, jūs varat izmantot dažādas sadalīšanas izmērus un stratēģijas. Pašlaik mēs atbalstām sadalīšanu pēc fiksēta izmēra, sadalīšanu pēc fiksēta izmēra ar pārklājošām sadaļām, sadalīšanu pēc teikuma un sadalīšanu pēc rindkopa. Teksta sadalītājs tiek izmantots Mezglu parsētājā, sadalot `Dokumentus` par `Mezgliem`.

- [**Atgūtājs**](./low_level/retriever.md): Atgūtājs ir tas, kas faktiski izvēlas Mezglus, ko atgūt no indeksa. Šeit jūs varat izmēģināt atgūt vairāk vai mazāk Mezglu vienā vaicājumā, mainīt līdzības funkciju vai izveidot savu atgūtāju katram individuālam lietojumam jūsu lietotnē. Piemēram, jūs varat vēlēties atsevišķu atgūtāju koda saturam un teksta saturam.

- [**Atbildes sintezētājs**](./low_level/response_synthesizer.md): Atbildes sintezētājs ir atbildīgs par vaicājuma virknes ņemšanu un saraksta `Mezglu` izmantošanu, lai ģenerētu atbildi. Tas var būt dažādās formās, piemēram, iterējot cauri visam kontekstam un precizējot atbildi vai veidojot koka kopsavilkumu un atgriežot saknes kopsavilkumu.

- [**Krātuve**](./low_level/storage.md): Izmantojot indeksus, datus un vektorus, jūs vēlēsieties tos saglabāt, nevis katru reizi palaist iegultā modeļa. IndexStore, DocStore, VectorStore un KVStore ir abstrakcijas, kas ļauj jums to darīt. Kopā tie veido StorageContext. Pašlaik mēs ļaujam saglabāt iegultās vērtības failos failu sistēmā (vai virtuālā atmiņas failu sistēmā), bet arī aktīvi pievienojam integrācijas ar vektora datu bāzēm.
