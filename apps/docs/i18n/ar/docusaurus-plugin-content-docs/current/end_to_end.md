---
sidebar_position: 4
---

# أمثلة من البداية إلى النهاية

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

نقدم العديد من الأمثلة من البداية إلى النهاية باستخدام LlamaIndex.TS في المستودع

تحقق من الأمثلة أدناه أو جربها وأكملها في دقائق مع دروس تفاعلية على Github Codespace المقدمة من Dev-Docs [هنا](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [محرك الدردشة](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

اقرأ ملفًا وتحدث عنه مع LLM.

## [فهرس الفيكتور](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

إنشاء فهرس فيكتور واستعلامه. سيستخدم فهرس الفيكتور التضمينات لاسترداد أعلى k عقد ذات صلة. بشكل افتراضي ، يكون k الأعلى هو 2.

"

## [مؤشر الملخص](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

إنشاء مؤشر قائمة واستعلامه. يستخدم هذا المثال أيضًا `LLMRetriever` ، الذي سيستخدم LLM لتحديد أفضل العقد لاستخدامها عند إنشاء الإجابة.

"

## [حفظ / تحميل فهرس](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

إنشاء وتحميل فهرس ناقل. يحدث التخزين المؤقت على القرص تلقائيًا في LlamaIndex.TS بمجرد إنشاء كائن سياق التخزين.

"

## [فهرس الناقل المخصص](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

إنشاء فهرس ناقل واستعلامه، مع تكوين `LLM` و `ServiceContext` و `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

أنشئ OpenAI LLM واستخدمه مباشرة للدردشة.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

إنشاء Llama-2 LLM واستخدامه مباشرة للدردشة.

"

## [محرك استعلام الأسئلة الفرعية](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

يستخدم `محرك استعلام الأسئلة الفرعية` الذي يقسم الاستعلامات المعقدة إلى أسئلة فرعية متعددة، ثم يجمع الاستجابة عبر الإجابات على جميع الأسئلة الفرعية.

"

## [وحدات منخفضة المستوى](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

يستخدم هذا المثال العديد من المكونات منخفضة المستوى، مما يزيل الحاجة إلى محرك استعلام فعلي. يمكن استخدام هذه المكونات في أي مكان، في أي تطبيق، أو تخصيصها وتصنيفها الفرعي لتلبية احتياجاتك الخاصة.
