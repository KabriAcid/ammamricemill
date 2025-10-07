import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/purchase/rice - list rice purchases (uses purchases table)
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    let dateCondition = "p.status != 'cancelled'";
    const params = [];
    if (fromDate && toDate) {
      dateCondition += " AND p.date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no as invoiceNo, p.challan_no as challanNo,
							p.party_id as partyId, pt.name as partyName, p.total_quantity as totalQuantity,
							p.total_net_weight as totalNetWeight, p.invoice_amount as invoiceAmount,
							p.total_amount as totalAmount, p.paid_amount as paidAmount, p.current_balance as currentBalance,
							p.status
			 FROM purchases p
			 LEFT JOIN parties pt ON p.party_id = pt.id
			 WHERE ${dateCondition}
			 ORDER BY p.date DESC, p.created_at DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/purchase/rice/:id - fetch single purchase and items
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [purchases] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no as invoiceNo, p.challan_no as challanNo,
							p.party_id as partyId, pt.name as partyName, p.total_quantity as totalQuantity,
							p.total_net_weight as totalNetWeight, p.invoice_amount as invoiceAmount,
							p.total_amount as totalAmount, p.paid_amount as paidAmount, p.current_balance as currentBalance,
							p.status
			 FROM purchases p
			 LEFT JOIN parties pt ON p.party_id = pt.id
			 WHERE p.id = ?`,
      [id]
    );

    if (purchases.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Purchase not found" });

    const [items] = await pool.query(
      `SELECT pi.id, pi.category_id as categoryId, c.name as categoryName, pi.product_id as productId,
							pr.name as productName, pi.godown_id as godownId, g.name as godownName, pi.quantity,
							pi.net_weight as netWeight, pi.rate, pi.total_price as totalPrice
			 FROM purchase_items pi
			 LEFT JOIN categories c ON pi.category_id = c.id
			 LEFT JOIN products pr ON pi.product_id = pr.id
			 LEFT JOIN godowns g ON pi.godown_id = g.id
			 WHERE pi.purchase_id = ?
			 ORDER BY pi.id`,
      [id]
    );

    res.json({ success: true, data: { ...purchases[0], items } });
  } catch (err) {
    next(err);
  }
});

export default router;
