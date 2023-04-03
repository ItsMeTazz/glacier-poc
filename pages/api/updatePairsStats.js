import { updatePairsStats } from "./helper";

export default async function handler(_req, res) {
  console.log('[updatePairsStats] --')
  await updatePairsStats();
  res.status(200).json(true);
}
