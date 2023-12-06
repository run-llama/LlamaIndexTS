# Moduły podstawowe

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

LlamaIndex.TS oferuje kilka modułów podstawowych, podzielonych na moduły wysokiego poziomu, które umożliwiają szybkie rozpoczęcie pracy, oraz moduły niskiego poziomu, które umożliwiają dostosowanie kluczowych komponentów według potrzeb.

## Moduły wysokiego poziomu

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument reprezentuje plik tekstowy, plik PDF lub inny ciągły fragment danych.

- [**Węzeł**](./high_level/documents_and_nodes.md): Podstawowy element budujący dane. Najczęściej są to części dokumentu podzielone na zarządzalne fragmenty, które są wystarczająco małe, aby można je było przekazać do modelu osadzającego i LLM.

- [**Czytnik/Ładowarka**](./high_level/data_loader.md): Czytnik lub ładowarka to narzędzie, które pobiera dokument ze świata rzeczywistego i przekształca go w klasę Dokumentu, która może być używana w indeksie i zapytaniach. Obecnie obsługujemy pliki tekstowe i pliki PDF, a wkrótce pojawi się wiele innych formatów.

- [**Indeksy**](./high_level/data_index.md): Indeksy przechowują węzły i osadzenia tych węzłów.

- [**Silnik zapytań**](./high_level/query_engine.md): Silniki zapytań generują zapytanie, które wprowadzasz i zwracają wynik. Silniki zapytań zazwyczaj łączą gotowe podpowiedzi z wybranymi węzłami z indeksu, aby dostarczyć LLM kontekstu, który jest potrzebny do odpowiedzi na Twoje zapytanie.

- [**Silnik czatu**](./high_level/chat_engine.md): Silnik czatu pomaga w budowie chatbota, który będzie współpracować z Twoimi indeksami.

## Moduł niskiego poziomu

- [**LLM**](./low_level/llm.md): Klasa LLM to zintegrowane interfejsy dla dostawców dużych modeli językowych, takich jak OpenAI GPT-4, Anthropic Claude lub Meta LLaMA. Można ją podklasować, aby napisać łącznik do własnego dużego modelu językowego.

- [**Embedding**](./low_level/embedding.md): Osadzenie jest reprezentowane jako wektor liczb zmiennoprzecinkowych. Domyślnym modelem osadzania jest text-embedding-ada-002 od OpenAI, a każde wygenerowane osadzenie składa się z 1536 liczb zmiennoprzecinkowych. Innym popularnym modelem osadzania jest BERT, który używa 768 liczb zmiennoprzecinkowych do reprezentacji każdego węzła. Oferujemy wiele narzędzi do pracy z osadzeniami, w tym 3 opcje obliczania podobieństwa i maksymalne marginalne znaczenie.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategie podziału tekstu są niezwykle ważne dla ogólnej skuteczności wyszukiwania osadzeń. Obecnie, mimo że mamy domyślne ustawienia, nie ma jednego rozwiązania, które pasuje do wszystkich przypadków. W zależności od dokumentów źródłowych, możesz chcieć użyć różnych rozmiarów i strategii podziału. Obecnie obsługujemy podział według stałego rozmiaru, podział według stałego rozmiaru z nakładającymi się sekcjami, podział według zdań i podział według akapitów. Podział tekstu jest używany przez NodeParser do podziału `Documentów` na `Węzły`.

- [**Retriever**](./low_level/retriever.md): Retriever to element, który faktycznie wybiera Węzły do pobrania z indeksu. Tutaj możesz spróbować pobierać więcej lub mniej Węzłów na zapytanie, zmieniać funkcję podobieństwa lub tworzyć własne retrievery dla każdego indywidualnego przypadku w aplikacji. Na przykład możesz chcieć mieć oddzielny retriever dla treści kodu i treści tekstowych.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer jest odpowiedzialny za przetwarzanie ciągu zapytania i używanie listy `Węzłów` do generowania odpowiedzi. Może to przybrać wiele form, na przykład iterowanie po całym kontekście i dopracowywanie odpowiedzi lub budowanie drzewa podsumowań i zwracanie korzenia podsumowania.

- [**Storage**](./low_level/storage.md): W pewnym momencie będziesz chciał przechowywać swoje indeksy, dane i wektory, zamiast uruchamiać modele osadzające za każdym razem. IndexStore, DocStore, VectorStore i KVStore to abstrakcje, które umożliwiają to. Razem tworzą StorageContext. Obecnie umożliwiamy zapisywanie osadzeń w plikach na systemie plików (lub wirtualnym systemie plików w pamięci), ale aktywnie dodajemy również integracje z bazami danych wektorowymi.
