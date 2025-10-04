import express from "express";

const router = express.Router();

// In-memory store for demo (replace with DB in production)
let partyTypes = [
  { id: 1, name: "Supplier", description: "Supplies raw materials" },
  { id: 2, name: "Customer", description: "Buys finished goods" },
];

// GET /api/party/types
router.get("/", (req, res) => {
  try {
    const { search = "" } = req.query;
    const filtered = partyTypes.filter(
      (pt) =>
        pt.name.toLowerCase().includes(search.toLowerCase()) ||
        pt.description.toLowerCase().includes(search.toLowerCase())
    );
    res.json({
      success: true,
      data: filtered,
      message: "Party types retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/party/types
router.post("/", (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }
    const newType = {
      id: Date.now(),
      name,
      description,
    };
    partyTypes.unshift(newType);
    res.status(201).json({
      success: true,
      data: newType,
      message: "Party type created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/party/types/:id
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }
    let updated = null;
    partyTypes = partyTypes.map((pt) => {
      if (pt.id === Number(id)) {
        updated = { ...pt, name, description };
        return updated;
      }
      return pt;
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Party type not found",
      });
    }
    res.json({
      success: true,
      data: updated,
      message: "Party type updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/party/types (bulk delete)
router.delete("/", (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of IDs to delete",
      });
    }
    const numericIds = ids.map((id) => Number(id));
    const initialLength = partyTypes.length;
    partyTypes = partyTypes.filter((pt) => !numericIds.includes(pt.id));
    const deletedCount = initialLength - partyTypes.length;

    res.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} party type(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
