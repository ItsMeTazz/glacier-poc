// Fake users data
const users = [1, 2, 3];

export default function handler(_req, res) {
  // Get data from your database
  res.status(200).json(users);
}
