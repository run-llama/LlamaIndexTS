# Moduli principali

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

LlamaIndex.TS offre diversi moduli principali, suddivisi in moduli di alto livello per iniziare rapidamente e moduli di basso livello per personalizzare i componenti chiave come desideri.

## Moduli di alto livello

- [**Documento**](./high_level/documents_and_nodes.md): Un documento rappresenta un file di testo, un file PDF o un'altra porzione di dati contigui.

- [**Nodo**](./high_level/documents_and_nodes.md): Il blocco di base dei dati. Più comunemente, questi sono parti del documento suddivise in pezzi gestibili abbastanza piccoli da poter essere inseriti in un modello di embedding e LLM.

- [**Lettore/Caricatore**](./high_level/data_loader.md): Un lettore o caricatore è qualcosa che prende un documento nel mondo reale e lo trasforma in una classe Document che può quindi essere utilizzata nel tuo indice e nelle tue query. Attualmente supportiamo file di testo semplice e PDF con molti altri formati in arrivo.

- [**Indici**](./high_level/data_index.md): gli indici memorizzano i nodi e gli embedding di quei nodi.

- [**Motore di query**](./high_level/query_engine.md): I motori di query generano la query che inserisci e restituiscono il risultato. I motori di query combinano generalmente un prompt predefinito con i nodi selezionati dal tuo indice per fornire al LLM il contesto di cui ha bisogno per rispondere alla tua query.

- [**Motore di chat**](./high_level/chat_engine.md): Un motore di chat ti aiuta a costruire un chatbot che interagirà con i tuoi indici.

## Modulo di basso livello

- [**LLM**](./low_level/llm.md): La classe LLM è un'interfaccia unificata su un grande provider di modelli di linguaggio come OpenAI GPT-4, Anthropic Claude o Meta LLaMA. Puoi sottoclassificarla per scrivere un connettore per il tuo grande modello di linguaggio.

- [**Embedding**](./low_level/embedding.md): Un embedding è rappresentato come un vettore di numeri in virgola mobile. Il modello di embedding predefinito di OpenAI, text-embedding-ada-002, consiste in 1.536 numeri in virgola mobile. Un altro modello di embedding popolare è BERT, che utilizza 768 numeri in virgola mobile per rappresentare ogni nodo. Forniamo una serie di utilità per lavorare con gli embedding, inclusi 3 opzioni di calcolo della similarità e Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Le strategie di divisione del testo sono estremamente importanti per l'efficacia complessiva della ricerca dell'embedding. Attualmente, sebbene abbiamo una divisione predefinita, non esiste una soluzione universale. A seconda dei documenti di origine, potresti voler utilizzare diverse dimensioni e strategie di divisione. Attualmente supportiamo la divisione per dimensione fissa, la divisione per dimensione fissa con sezioni sovrapposte, la divisione per frase e la divisione per paragrafo. Il text splitter viene utilizzato dal NodeParser per dividere i `Document` in `Node`.

- [**Retriever**](./low_level/retriever.md): Il Retriever è ciò che effettivamente sceglie i Node da recuperare dall'indice. Qui, potresti voler provare a recuperare più o meno Node per query, cambiare la tua funzione di similarità o creare il tuo retriever per ogni caso d'uso specifico nella tua applicazione. Ad esempio, potresti voler avere un retriever separato per il contenuto del codice rispetto al contenuto del testo.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): Il ResponseSynthesizer è responsabile di prendere una stringa di query e utilizzare una lista di `Node` per generare una risposta. Questo può assumere molte forme, come iterare su tutto il contesto e affinare una risposta o costruire un albero di riassunti e restituire il riassunto principale.

- [**Storage**](./low_level/storage.md): A un certo punto vorrai archiviare i tuoi indici, dati e vettori anziché eseguire nuovamente i modelli di embedding ogni volta. IndexStore, DocStore, VectorStore e KVStore sono astrazioni che ti consentono di farlo. Insieme, formano il StorageContext. Attualmente, ti consentiamo di persistere i tuoi embedding in file sul filesystem (o in un filesystem virtuale in memoria), ma stiamo anche aggiungendo attivamente integrazioni con Vector Databases.
