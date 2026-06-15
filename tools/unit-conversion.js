import { z } from "zod";
import { OPENWEATHER_API_KEY } from "../config.js";
import { defineTool } from "../utils/func-tool.js";


// 定義工具的 JSON Schema  
const toolSchema = {  
    name: "convert_unit",  
    parameters: {  
      value: "number", // 數字，如 25  
      from_unit: "string", // 原始單位  
      to_unit: "string", // 目標單位  
    },  
  }; 

  // 單位換算函數  
async function convertUnit(value, from_unit, to_unit) {  
    if (typeof value !== "number" || typeof from_unit !== "string" || typeof to_unit !== "string") {  
      return {  
        error: "Invalid parameter types",  
        message: "Ensure 'value' is a number, and 'from_unit' and 'to_unit' are strings.",  
      };  
    }  
    
    // 單位換算表  
    const conversionTable = {  
      "C->F": (v) => v * 9 / 5 + 32, // 攝氏 → 華氏  
      "F->C": (v) => (v - 32) * 5 / 9, // 華氏 → 攝氏  
      "km->mile": (v) => v * 0.621371, // 公里 → 英里  
      "mile->km": (v) => v / 0.621371, // 英里 → 公里  
      "kg->lb": (v) => v * 2.20462, // 公斤 → 磅  
      "lb->kg": (v) => v / 2.20462, // 磅 → 公斤  
    };  
    
    // 組合Key值  
    const key = `${from_unit}->${to_unit}`;  
    
    // 檢查是否支援該單位組合並執行換算  
    if (conversionTable[key]) {  
      return {  
        result: conversionTable[key](value),  
        unit: to_unit,  
      };  
    } else {  
      // 不支援的單位組合  
      return {  
        error: "Unsupported unit conversion",  
        message: `由 '${from_unit}' 轉換至 '${to_unit}' 目前不支援。`,  
      };  
    }  
  
  }  

  export const unitConversionTool = defineTool({
    name: "convert_unit",
    description: "單位換算，包括溫度、長度、重量。",
    fn: convertUnit,
    parameters: z.object({
      value: z.string().describe("數字"),
      from_unit: z.string().describe("原始單位"),
      to_unit: z.string().describe("目標單位"),
    }),
  });
