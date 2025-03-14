export const defaultEvaluationParser = (
  evalResponse: string,
): [number, string] => {
  const [scoreStr, reasoningStr] = evalResponse.split("\n") as [string, string];
  const score = parseFloat(scoreStr);
  const reasoning = reasoningStr.trim();
  return [score, reasoning];
};
