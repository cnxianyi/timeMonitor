import { ProgramData, Title } from "@/type/getTime";
import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const router = Router();

// 获取当前日期，并格式化为 MM-DD
const getCurrentDateFileName = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份 (1-12)
  const day = String(now.getDate()).padStart(2, "0"); // 日期 (1-31)
  return `${month}-${day}.json`;
};

// 读取 JSON 文件
const readJsonFile = (fileName: string): Title => {
  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    //console.log(`File does not exist. Creating a new file: ${fileName}`);
    const initialData: Title = {
      Limit: 1 * 60 * 60 * 3,
    };
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as Title;
  } catch (error) {
    console.error(`Error reading or parsing file: ${fileName}`, error);
    return {};
  }
};

// 保存 JSON 文件
const saveJsonFile = (fileName: string, data: Title) => {
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// 计算所有数字值的总和
const calculateTotal = (data: Title): number => {
  let total = 0;
  data.all = 0;
  const accumulateTotal = (data: Title) => {
    for (const value of Object.values(data)) {
      if (typeof value === "number") {
        total += value;
      } else if (typeof value === "object" && "program" in value) {
        const programData = value as ProgramData;
        for (const count of Object.values(programData.program)) {
          total += count;
        }
      }
    }
  };

  accumulateTotal(data);

  return total;
};

// 合并数据
const mergeData = (originalData: Title, newData: Title): Title => {
  const mergedData: Title = { ...originalData };

  // 合并数据
  for (const [key, value] of Object.entries(newData)) {
    if (typeof value === "number") {
      if (typeof mergedData[key] === "number") {
        mergedData[key] += value;
      } else {
        mergedData[key] = value;
      }
    } else if (typeof value === "object" && "program" in value) {
      const programData = value as ProgramData;
      if (
        !(key in mergedData) ||
        typeof mergedData[key] !== "object" ||
        !("program" in mergedData[key])
      ) {
        mergedData[key] = programData;
      } else {
        const originalProgram = (mergedData[key] as ProgramData).program || {};
        const newProgram = programData.program || {};
        mergedData[key] = {
          program: {
            ...originalProgram,
            ...Object.entries(newProgram).reduce(
              (acc, [programKey, programValue]) => {
                acc[programKey] = (originalProgram[programKey] || 0) + programValue;
                return acc;
              },
              {} as { [key: string]: number },
            ),
          },
        };
      }
    }
  }

  // 更新 `all` 字段为合并后的所有时间总和
  mergedData.all = calculateTotal(mergedData);

  return mergedData;
};

function consolidateData(data: Title): Title {
  const result: Title = {};

  for (const key in data) {
    if (key === "all" || key === "Limit") {
      // all 属性单独处理
      result[key] = data[key];
    } else if (typeof data[key] === "number") {
      // 普通数字属性直接赋值
      result[key] = data[key] as number;
    } else if (typeof data[key] === "object" && "program" in data[key]) {
      // 累加 program 对象中的数值
      const programData = data[key] as ProgramData;
      const programValues = Object.values(programData.program);
      const sum = programValues.reduce((acc, val) => acc + val, 0);
      result[key] = sum;
    }
  }

  // // 更新 all 属性的值
  // if (result.all !== undefined) {
  //   const totalSum = Object.values(result).reduce((acc, val) => typeof val === 'number' ? acc + val : acc, 0);
  //   result.all = totalSum;
  // }
  result.all = (result.all as number) - (result.Limit as number);

  return result;
}

// GET 请求处理
router.get("/monitor", (req, res) => {
  res.sendFile(path.join(__dirname, "getTime.html"));
});

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    code: 200,
    msg: "success",
    data: JSON.parse(JSON.stringify(readJsonFile(getCurrentDateFileName()))),
  });
});

// POST 请求处理
router.post("/", (req: Request, res: Response) => {
  //console.log(req.body);

  const fileName = getCurrentDateFileName();
  const originalData = readJsonFile(fileName);

  const mergedData = mergeData(originalData, req.body);

  // 保存合并后的数据
  saveJsonFile(fileName, mergedData);

  consolidateData(mergedData);

  const allValue = mergedData.all as number;
  const limitValue = mergedData.Limit as number;

  console.log("今日时间:", allValue - limitValue);
  console.log("剩余时间:", limitValue - (allValue - limitValue));

  res.status(200).json({
    code: 200,
    msg: "success",
    data: {
      time: limitValue - (allValue - limitValue),
    },
  });
});

// 构造文件路径
const settingFile = path.join(__dirname, "setting.json");

// POST 请求处理
router.get("/setLimit", async (req: Request, res: Response) => {
  console.log(req.query);
  if (req.query.type === "today") {
    const fileName = path.join(__dirname, getCurrentDateFileName());
    await fs.readFile(fileName, "utf8", (err, data) => {
      if (err) {
        console.error("读取文件时发生错误:", err);
        return;
      }
      try {
        // 解析 JSON 数据
        const settings = JSON.parse(data);

        // 修改对象中的 Limit
        settings.Limit += +req.query.limit! * 60; // 根据需要修改 Limit 的值

        // 将修改后的对象转换为 JSON 字符串
        const updatedData = JSON.stringify(settings, null, 2);

        // 写回文件
        fs.writeFile(fileName, updatedData, "utf8", (writeErr) => {
          if (writeErr) {
            console.error("写入文件时发生错误:", writeErr);
            return;
          }
          console.log("文件已成功更新");
        });
      } catch (parseErr) {
        console.error("解析 JSON 时发生错误:", parseErr);
      }
    });
    res.status(200).json({
      code: 200,
      msg: `今日时间增加 ${req.query.limit} 分钟`,
      data: {
        limit: req.query.limit,
      },
    });
  } else if (req.query.type === "always") {
    await fs.writeFileSync(
      settingFile,
      JSON.stringify(
        {
          Limit: +req.query.limit! * 60,
        },
        null,
        2,
      ),
      "utf-8",
    );
    await fs.readFile(settingFile, "utf8", (err, data) => {
      if (err) {
        console.error("读取文件时发生错误:", err);
        return;
      }
      try {
        const settings = JSON.parse(data);
        console.log("文件内容:", settings);
        res.status(200).json({
          code: 200,
          msg: `永久时间调整为 ${settings.Limit / 60} 分钟`,
          data: {
            limit: req.query.limit,
          },
        });
      } catch (parseErr) {
        console.error("解析 JSON 时发生错误:", parseErr);
      }
    });
  }
});

export default router;
