import type { NextApiRequest, NextApiResponse } from "next";

// Fake users data
const users: Number[] = [1, 2, 3];

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Number[]>
) {
  // Get data from your database
  res.status(200).json(users);
}
