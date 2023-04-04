import { updatePairsStats } from "./helper";

export default async function handler(_req, res) {
  const startIndex = Number(_req.query.start);
  const endIndex = Number(_req.query.end);
  const result = await updatePairsStats(
    startIndex ? startIndex : 0,
    endIndex ? endIndex : 0
  );
  res.status(200).json(result);
}
