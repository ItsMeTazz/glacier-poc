import { checkNewPairs } from "./helper";

export default async function handler(_req, res) {
  await checkNewPairs();
  res.status(200).json(true);
}
