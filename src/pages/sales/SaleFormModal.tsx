import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Plus, ShoppingCart } from "lucide-react";
import type { Sale, SaleItem } from "../../types/sales";

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Sale>) => Promise<void>;
  item: Sale | null;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Sale>>({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    challanNo: "",
    partyId: "",
    transportInfo: "",
    notes: "",
    items: [],
    totalQuantity: 0,
    totalNetWeight: 0,
    invoiceAmount: 0,
    discount: 0,
    totalAmount: 0,
    previousBalance: 0,
    netPayable: 0,
    paidAmount: 0,
    currentBalance: 0,
  });

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [godowns, setGodowns] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [parties, setParties] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        setCategories([
          { id: "1", name: "Paddy" },
          { id: "2", name: "Head Rice" },
        ]);
        setProducts([
          { id: "1", name: "Normal Paddy" },
          { id: "2", name: "PADDY GRADE C" },
          { id: "3", name: "Head Rice 50 Kg" },
          { id: "4", name: "Head Rice 25 Kg" },
        ]);
        setGodowns([
          { id: "1", name: "Main Warehouse" },
          { id: "2", name: "Storage A" },
          { id: "3", name: "Storage B" },
        ]);
        setParties([
          { id: "1", name: "ABC Traders" },
          { id: "2", name: "XYZ Company" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleItemChange = (
    index: number,
    field: keyof SaleItem,
    value: any
  ) => {
    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Recalculate item total
      if (["quantity", "rate"].includes(field)) {
        newItems[index].totalPrice =
          (newItems[index].quantity || 0) * (newItems[index].rate || 0);
      }

      // Recalculate totals
      const totalQuantity = newItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      const totalNetWeight = newItems.reduce(
        (sum, item) => sum + (item.netWeight || 0),
        0
      );
      const invoiceAmount = newItems.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0
      );
      const totalAmount = invoiceAmount - (prev.discount || 0);
      const netPayable = totalAmount + (prev.previousBalance || 0);
      const currentBalance = netPayable - (prev.paidAmount || 0);

      return {
        ...prev,
        items: newItems,
        totalQuantity,
        totalNetWeight,
        invoiceAmount,
        totalAmount,
        netPayable,
        currentBalance,
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          id: Date.now().toString(),
          categoryId: "",
          productId: "",
          size: "",
          stock: 0,
          godownId: "",
          quantity: 0,
          netWeight: 0,
          rate: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving sale:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Edit Sale" : "New Sale"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice No *
            </label>
            <input
              type="text"
              value={formData.invoiceNo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, invoiceNo: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challan No
            </label>
            <input
              type="text"
              value={formData.challanNo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, challanNo: e.target.value }))
              }
              className="input-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party *
            </label>
            <select
              value={formData.partyId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, partyId: e.target.value }))
              }
              className="input-base"
              required
            >
              <option value="">Select Party</option>
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transport Info
            </label>
            <input
              type="text"
              value={formData.transportInfo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportInfo: e.target.value,
                }))
              }
              className="input-base"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
            <Button
              type="button"
              onClick={addItem}
              icon={Plus}
              size="sm"
              variant="outline"
            >
              Add Product
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stocks
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select Godown
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Weight
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Add To Cart
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items?.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-3 py-2">
                      <select
                        value={item.categoryId}
                        onChange={(e) =>
                          handleItemChange(index, "categoryId", e.target.value)
                        }
                        className="input-base text-sm py-1"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "productId", e.target.value)
                        }
                        className="input-base text-sm py-1"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.size || ""}
                        onChange={(e) =>
                          handleItemChange(index, "size", e.target.value)
                        }
                        className="input-base text-sm py-1"
                        placeholder="Size"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.stock || 0}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                        className="input-base text-sm py-1 bg-gray-50"
                        readOnly
                        placeholder="Available Stock"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.godownId}
                        onChange={(e) =>
                          handleItemChange(index, "godownId", e.target.value)
                        }
                        className="input-base text-sm py-1"
                        required
                      >
                        <option value="">Select Godown</option>
                        {godowns.map((godown) => (
                          <option key={godown.id} value={godown.id}>
                            {godown.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="input-base text-sm py-1"
                        min="0"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.netWeight}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "netWeight",
                            Number(e.target.value)
                          )
                        }
                        className="input-base text-sm py-1"
                        min="0"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                        className="input-base text-sm py-1"
                        min="0"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.totalPrice}
                        className="input-base text-sm py-1 bg-gray-50"
                        readOnly
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        onClick={() => {
                          // Add to cart functionality can be implemented here
                          console.log("Added to cart:", item);
                        }}
                        icon={ShoppingCart}
                        size="sm"
                        variant="primary"
                      >
                        Add To Cart
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="input-base"
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Invoice Amount:</div>
              <div className="text-sm font-medium">
                ₦{formData.invoiceAmount?.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => {
                  const discount = Number(e.target.value);
                  setFormData((prev) => {
                    const invoiceAmount = prev.invoiceAmount || 0;
                    const previousBalance = prev.previousBalance || 0;
                    const paidAmount = prev.paidAmount || 0;

                    const totalAmount = invoiceAmount - discount;
                    const netPayable = totalAmount + previousBalance;
                    const currentBalance = netPayable - paidAmount;

                    return {
                      ...prev,
                      discount,
                      totalAmount,
                      netPayable,
                      currentBalance,
                    };
                  });
                }}
                className="input-base"
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Total Amount:</div>
              <div className="text-sm font-medium">
                ₦{formData.totalAmount?.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Balance
              </label>
              <input
                type="number"
                value={formData.previousBalance}
                onChange={(e) => {
                  const previousBalance = Number(e.target.value);
                  setFormData((prev) => {
                    const totalAmount = prev.totalAmount || 0;
                    const paidAmount = prev.paidAmount || 0;

                    const netPayable = totalAmount + previousBalance;
                    const currentBalance = netPayable - paidAmount;

                    return {
                      ...prev,
                      previousBalance,
                      netPayable,
                      currentBalance,
                    };
                  });
                }}
                className="input-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Net Payable:</div>
              <div className="text-sm font-medium">
                ₦{formData.netPayable?.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid Amount
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => {
                  const paidAmount = Number(e.target.value);
                  setFormData((prev) => {
                    const netPayable = prev.netPayable || 0;
                    const currentBalance = netPayable - paidAmount;

                    return {
                      ...prev,
                      paidAmount,
                      currentBalance,
                    };
                  });
                }}
                className="input-base"
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Current Balance:</div>
              <div className="text-sm font-medium">
                ₦{formData.currentBalance?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {item ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { SaleFormModal };
