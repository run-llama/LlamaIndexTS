export const transformObject = (
  obj: any,
  transfomer: Record<string, (value: any) => any>,
) => {
  const newObj: Record<string, any> = {};
  for (const key in transfomer) {
    newObj[key] = transfomer[key](obj[key]);
  }
  return newObj;
};

export const arrayKVtoObject = (
  array: {
    key: string;
    value: any;
  }[],
) => {
  const obj: Record<string, any> = {};
  for (const item of array) {
    obj[item.key] = item.value;
  }
  return obj;
};
