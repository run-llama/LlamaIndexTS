import { OpenAI } from "llamaindex";

// Example using OpenAI's chat API to extract JSON from a sales call transcript
// using json_mode see https://platform.openai.com/docs/guides/text-generation/json-mode for more details

const transcript =
  "[Phone rings]\n\nJohn: Hello, this is John.\n\nSarah: Hi John, this is Sarah from XYZ Company. I'm calling to discuss our new product, the XYZ Widget, and see if it might be a good fit for your business.\n\nJohn: Hi Sarah, thanks for reaching out. I'm definitely interested in learning more about the XYZ Widget. Can you give me a quick overview of what it does?\n\nSarah: Of course! The XYZ Widget is a cutting-edge tool that helps businesses streamline their workflow and improve productivity. It's designed to automate repetitive tasks and provide real-time data analytics to help you make informed decisions.\n\nJohn: That sounds really interesting. I can see how that could benefit our team. Do you have any case studies or success stories from other companies who have used the XYZ Widget?\n\nSarah: Absolutely, we have several case studies that I can share with you. I'll send those over along with some additional information about the product. I'd also love to schedule a demo for you and your team to see the XYZ Widget in action.\n\nJohn: That would be great. I'll make sure to review the case studies and then we can set up a time for the demo. In the meantime, are there any specific action items or next steps we should take?\n\nSarah: Yes, I'll send over the information and then follow up with you to schedule the demo. In the meantime, feel free to reach out if you have any questions or need further information.\n\nJohn: Sounds good, I appreciate your help Sarah. I'm looking forward to learning more about the XYZ Widget and seeing how it can benefit our business.\n\nSarah: Thank you, John. I'll be in touch soon. Have a great day!\n\nJohn: You too, bye.";

async function main() {
  const llm = new OpenAI({
    model: "gpt-4-1106-preview",
    additionalChatOptions: { response_format: { type: "json_object" } },
  });

  const example = {
    summary:
      "High-level summary of the call transcript. Should not exceed 3 sentences.",
    products: ["product 1", "product 2"],
    rep_name: "Name of the sales rep",
    prospect_name: "Name of the prospect",
    action_items: ["action item 1", "action item 2"],
  };

  const response = await llm.chat({
    messages: [
      {
        role: "system",
        content: `You are an expert assistant for summarizing and extracting insights from sales call transcripts.\n\nGenerate a valid JSON in the following format:\n\n${JSON.stringify(
          example,
        )}`,
      },
      {
        role: "user",
        content: `Here is the transcript: \n------\n${transcript}\n------`,
      },
    ],
  });

  const json = JSON.parse(response.message.content);

  console.log(json);
}

main().catch(console.error);
