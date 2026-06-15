import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));
//25 度 C 是華⽒幾度？
await initMessage(
    "你是一位單位轉換大師，提供溫度(攝氏與華氏)，長度(公里與英里)，重量(公斤與磅)的轉換。"
);

//25 度 C 是華⽒幾度？
//100公里是幾英里?
//80公斤是幾磅?
try {
    while (true) {
      const userQuestion = (
        await input({ message: "這個小工具提供溫度(攝氏與華氏)，長度(公里與英里)，重量(公斤與磅)的轉換, 請輸入你的單位轉換問題(ex:25 度 C 是華⽒幾度？)：" })
      ).trim();
  
      if (userQuestion === "") continue;
      if (userQuestion.toLowerCase() === "exit") {
        console.log("再會~");
        break;
      }
  
      await addMessage(userQuestion);

      const messages = [
        {
          role: "user",
          content: userQuestion  ,
        },
      ];



    while (true) {
    const spin = spinner("思考中...").start();

    const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        tools,
        tool_choice: "auto",
    });

    spin.stop();

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
        console.log(message.content);
        break;
    }

    for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const fn = AVAILABLE_TOOLS[fnName];
        const result = await fn(args);

        messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
        });
    }
    }
}
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}