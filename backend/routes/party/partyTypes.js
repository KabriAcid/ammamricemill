import express from "express";

const router = express.Router();

// In-memory store for demo (replace with DB in production)
let partyTypes = [
  { id: 1, name: "Supplier", description: "Supplies raw materials" },
  { id: 2, name: "Customer", description: "Buys finished goods" },
];

// GET /api/party-types?search=...
router.get("/party-types", (req, res) => {
  const { search = "" } = req.query;
  const filtered = partyTypes.filter(
    (pt) =>
      pt.name.toLowerCase().includes(search.toLowerCase()) ||
      pt.description.toLowerCase().includes(search.toLowerCase())
  );
  res.json(filtered);
});

// POST /api/party-types
router.post("/party-types", (req, res) => {
  const { name, description } = req.body;
  const newType = {
    id: Date.now(),
    name,
    description,
  };
  partyTypes.unshift(newType);
  res.json(newType);
});

// PUT /api/party-types/:id
router.put("/party-types/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  let updated = null;
  partyTypes = partyTypes.map((pt) => {
    if (pt.id === Number(id)) {
      updated = { ...pt, name, description };
      return updated;
    }
    return pt;
  });
  res.json(updated);
});

// DELETE /api/party-types/:id
router.delete("/party-types/:id", (req, res) => {
  const { id } = req.params;
  partyTypes = partyTypes.filter((pt) => pt.id !== Number(id));
  res.json({ success: true });
});

export default router;
