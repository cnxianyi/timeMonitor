export type ProgramData = {
  program: {
    [key: string]: number;
  }; // `program` 对象的每个键都是字符串，值是数字
};

export type Title = {
  [key: string]: ProgramData | number; // 顶级对象的每个键的值可以是 `ProgramData` 或单纯的数字
};
