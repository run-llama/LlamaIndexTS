# Kernmodule

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

LlamaIndex.TS bietet mehrere Kernmodule, die in High-Level-Module für einen schnellen Einstieg und Low-Level-Module für die Anpassung von Schlüsselkomponenten unterteilt sind, wie Sie es benötigen.

## High-Level-Module

- [**Dokument**](./high_level/documents_and_nodes.md): Ein Dokument repräsentiert eine Textdatei, eine PDF-Datei oder ein anderes zusammenhängendes Datenstück.

- [**Knoten**](./high_level/documents_and_nodes.md): Das grundlegende Datenbausteinelement. Am häufigsten handelt es sich dabei um Teile des Dokuments, die in handhabbare Stücke aufgeteilt sind, die klein genug sind, um in ein Einbettungsmodell und LLM eingespeist zu werden.

- [**Reader/Loader**](./high_level/data_loader.md): Ein Reader oder Loader ist etwas, das ein Dokument aus der realen Welt aufnimmt und in eine Dokumentklasse umwandelt, die dann in Ihrem Index und Ihren Abfragen verwendet werden kann. Derzeit unterstützen wir einfache Textdateien und PDFs mit vielen weiteren Formaten in Arbeit.

- [**Indizes**](./high_level/data_index.md): Indizes speichern die Knoten und die Einbettungen dieser Knoten.

- [**QueryEngine**](./high_level/query_engine.md): Query Engines generieren die Abfrage, die Sie eingeben, und geben Ihnen das Ergebnis zurück. Query Engines kombinieren in der Regel eine vorgefertigte Eingabeaufforderung mit ausgewählten Knoten aus Ihrem Index, um dem LLM den Kontext zu geben, den er zur Beantwortung Ihrer Abfrage benötigt.

- [**ChatEngine**](./high_level/chat_engine.md): Eine ChatEngine hilft Ihnen beim Aufbau eines Chatbots, der mit Ihren Indizes interagiert.

## Low-Level-Modul

- [**LLM**](./low_level/llm.md): Die LLM-Klasse ist eine einheitliche Schnittstelle über einen großen Sprachmodellanbieter wie OpenAI GPT-4, Anthropic Claude oder Meta LLaMA. Sie können sie unterklassifizieren, um eine Verbindung zu Ihrem eigenen großen Sprachmodell herzustellen.

- [**Embedding**](./low_level/embedding.md): Ein Embedding wird als Vektor von Gleitkommazahlen dargestellt. Das Standard-Embedding-Modell von OpenAI, text-embedding-ada-002, besteht aus 1.536 Gleitkommazahlen. Ein weiteres beliebtes Embedding-Modell ist BERT, das 768 Gleitkommazahlen verwendet, um jeden Knoten darzustellen. Wir bieten eine Reihe von Hilfsprogrammen zum Arbeiten mit Embeddings an, einschließlich 3 Optionen zur Ähnlichkeitsberechnung und Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Textaufteilungsstrategien sind von entscheidender Bedeutung für die Gesamtwirksamkeit der Embedding-Suche. Derzeit haben wir zwar eine Standardlösung, aber es gibt keine universelle Lösung. Je nach Quelldokumenten möchten Sie möglicherweise unterschiedliche Aufteilungsgrößen und -strategien verwenden. Derzeit unterstützen wir die Aufteilung nach fester Größe, die Aufteilung nach fester Größe mit überlappenden Abschnitten, die Aufteilung nach Satz und die Aufteilung nach Absatz. Der TextSplitter wird vom NodeParser verwendet, um `Document`s in `Node`s aufzuteilen.

- [**Retriever**](./low_level/retriever.md): Der Retriever wählt tatsächlich die Nodes aus, die aus dem Index abgerufen werden sollen. Hier können Sie versuchen, mehr oder weniger Nodes pro Abfrage abzurufen, Ihre Ähnlichkeitsfunktion zu ändern oder Ihren eigenen Retriever für jeden einzelnen Anwendungsfall in Ihrer Anwendung zu erstellen. Möglicherweise möchten Sie beispielsweise einen separaten Retriever für Code-Inhalte und Textinhalte haben.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): Der ResponseSynthesizer ist dafür verantwortlich, einen Abfragestring zu nehmen und mithilfe einer Liste von `Node`s eine Antwort zu generieren. Dies kann in verschiedenen Formen erfolgen, z. B. durch Iterieren über den gesamten Kontext und Verfeinern einer Antwort oder durch Erstellen eines Baums von Zusammenfassungen und Rückgabe der Wurzelzusammenfassung.

- [**Storage**](./low_level/storage.md): Irgendwann möchten Sie Ihre Indizes, Daten und Vektoren speichern, anstatt die Embedding-Modelle jedes Mal neu auszuführen. IndexStore, DocStore, VectorStore und KVStore sind Abstraktionen, mit denen Sie dies tun können. Zusammen bilden sie den StorageContext. Derzeit können Sie Ihre Embeddings in Dateien im Dateisystem (oder einem virtuellen Dateisystem im Arbeitsspeicher) speichern, aber wir fügen auch aktiv Integrationen zu Vektordatenbanken hinzu.
