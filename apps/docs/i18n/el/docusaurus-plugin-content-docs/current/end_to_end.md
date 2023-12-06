---
sidebar_position: 4
---

# Παραδείγματα από άκρη σε άκρη

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Περιλαμβάνουμε αρκετά παραδείγματα από άκρη σε άκρη χρησιμοποιώντας το LlamaIndex.TS στο αποθετήριο

Ελέγξτε τα παρακάτω παραδείγματα ή δοκιμάστε τα και ολοκληρώστε τα σε λίγα λεπτά με τα διαδραστικά εκπαιδευτικά παραδείγματα του Github Codespace που παρέχονται από το Dev-Docs [εδώ](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Μηχανή Συνομιλίας](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Διαβάστε ένα αρχείο και συζητήστε για αυτό με το LLM.

## [Δείκτης Vector](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Δημιουργήστε έναν δείκτη vector και κάντε ερωτήματα σε αυτόν. Ο δείκτης vector θα χρησιμοποιήσει ενσωματώσεις για να ανακτήσει τους k πιο σχετικούς κόμβους. Από προεπιλογή, το k είναι 2.

"

## [Σύνοψη Δείκτη](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Δημιουργήστε έναν δείκτη λίστας και κάντε ερωτήσεις σε αυτόν. Αυτό το παράδειγμα χρησιμοποιεί επίσης τον `LLMRetriever`, ο οποίος θα χρησιμοποιήσει το LLM για να επιλέξει τους καλύτερους κόμβους για χρήση κατά τη δημιουργία απάντησης.

"

## [Αποθήκευση / Φόρτωση ενός Δείκτη](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Δημιουργία και φόρτωση ενός δείκτη διανύσματος. Η αποθήκευση στον δίσκο στο LlamaIndex.TS γίνεται αυτόματα μόλις δημιουργηθεί ένα αντικείμενο περιβάλλοντος αποθήκευσης.

"

## [Προσαρμοσμένο Διάνυσμα Ευρετηρίου](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Δημιουργήστε ένα διάνυσμα ευρετηρίου και κάντε ερωτήσεις σε αυτό, ενώ παράλληλα ρυθμίζετε το `LLM`, το `ServiceContext` και το `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Δημιουργήστε ένα OpenAI LLM και χρησιμοποιήστε το απευθείας για συνομιλία.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Δημιουργήστε ένα Llama-2 LLM και χρησιμοποιήστε το απευθείας για συνομιλία.

"

## [Μηχανή Ερωτήσεων Υπο-Ερώτησης (SubQuestionQueryEngine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Χρησιμοποιεί την `Μηχανή Ερωτήσεων Υπο-Ερώτησης (SubQuestionQueryEngine)`, η οποία διασπά πολύπλοκες ερωτήσεις σε πολλαπλές υπο-ερωτήσεις και στη συνέχεια συγκεντρώνει μια απάντηση από τις απαντήσεις όλων των υπο-ερωτήσεων.

"

## [Χαμηλού Επιπέδου Ενότητες](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Αυτό το παράδειγμα χρησιμοποιεί αρκετές ενότητες χαμηλού επιπέδου, οι οποίες αφαιρούν την ανάγκη για έναν πραγματικό μηχανισμό ερωτήσεων. Αυτές οι ενότητες μπορούν να χρησιμοποιηθούν οπουδήποτε, σε οποιαδήποτε εφαρμογή, ή να προσαρμοστούν και να υποκλασιοποιηθούν για να ικανοποιήσουν τις δικές σας ανάγκες.

"
