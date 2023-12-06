---
sidebar_position: 4
---

# דוגמאות מתחילה עד סוף

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

אנחנו כוללים מספר דוגמאות מתחילה עד סוף בשימוש ב־LlamaIndex.TS במאגר

בדקו את הדוגמאות למטה או נסו אותן והשלימו אותן בדקות עם המדריכים האינטראקטיביים של Github Codespace שמסופקים על ידי Dev-Docs [כאן](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [מנוע צ'אט](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

קרא קובץ ודבר עליו עם ה־LLM.

## [אינדקס וקטור](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

צור אינדקס ופנה אליו. האינדקס ישתמש ב־embeddings כדי להביא את הצמתים המרכזיים ביותר ב־k הגבוה ביותר. כברירת מחדל, k הוא 2.

"

## [אינדקס סיכום](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

צור אינדקס רשימה ושאילתה אותו. דוגמה זו משתמשת גם ב- `LLMRetriever`, שיכול להשתמש ב- LLM כדי לבחור את הצמתים הטובים ביותר לשימוש בעת יצירת תשובה.

"

## [שמירה / טעינה של אינדקס](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

יצירה וטעינה של אינדקס וקטור. השמירה לדיסק ב־LlamaIndex.TS מתרחשת אוטומטית כאשר נוצר אובייקט של מקור אחסון.

"

## [מסד נתונים מותאם אישית של מדד וקטורים](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

צור מסד נתונים מדד וקטורים ושאל אותו, תוך הגדרת ה־`LLM`, ה־`ServiceContext`, וה־`similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

צור OpenAI LLM והשתמש בו ישירות לשיחה.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

צור Llama-2 LLM והשתמש בו ישירות לצורך צ'אט.

## [מנוע שאילתות לשאלות משנה](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

משתמש ב־`מנוע שאילתות לשאלות משנה`, שמפצל שאילתות מורכבות לשאלות משנה מרובות, ואז מצטבר תשובה מעל כל התשובות לשאלות המשנה.

"

## [מודולים ברמה נמוכה](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

דוגמה זו משתמשת במרכיבים ברמה נמוכה מרובים, שמסירים את הצורך במנוע שאילתות אמיתי. ניתן להשתמש במרכיבים אלו בכל מקום, בכל אפליקציה, או להתאים אותם וליצור תת-מחלקות על פי הצורך האישי שלכם.

"
