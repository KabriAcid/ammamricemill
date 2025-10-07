import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Production, ProductionItem } from "../../types/production";
import { formatNumber } from "../../utils/formatters";
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";
import { ApiResponse } from "../../types";

interface ProductionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Production>) => Promise<boolean> | Promise<void>;
  item?: Production | null;
}

const ProductionFormModal: React.FC<ProductionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
}) => {
  const [formData, setFormData] = useState<Partial<Production>>({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    siloInfo: "",
    items: [],
    totalQuantity: 0,
    totalWeight: 0,
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMasterData = async () => {
      setInitialLoading(true);
      setLoading(true);
      try {
        const [prodResp, catResp, godownResp] = await Promise.all([
          api.get<ApiResponse<{ id: string; name: string }[]>>("/products"),
          api.get<ApiResponse<{ id: string; name: string }[]>>("/categories"),
          api.get<ApiResponse<{ id: string; name: string }[]>>("/godowns"),
        ]);

        if (prodResp.success && prodResp.data) {
          const loadedProducts = prodResp.data.map((p) => ({
            id: String(p.id),
            name: p.name,
          }));
          setProducts(loadedProducts);

          setFormData((prev) => {
            if (item) return prev;
            if (prev.items && prev.items.length) return prev;
            return {
              ...prev,
              items: loadedProducts.map((p) => ({
                id: p.id,
                categoryId: "",
                productId: p.id,
                godownId: "",
                siloId: "",
                quantity: 0,
                netWeight: 0,
              })),
            };
          });
        }

        if (catResp.success && catResp.data) {
          setCategories(
            catResp.data.map((c) => ({ id: String(c.id), name: c.name }))
          );
        }

        if (godownResp.success && godownResp.data) {
          setGodowns(
            godownResp.data.map((g) => ({ id: String(g.id), name: g.name }))
          );
        }
      } catch (error: any) {
        console.error("Error fetching master data:", error);
        showToast(error?.message || "Failed to load master data", "error");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    if (isOpen) fetchMasterData();
  }, [isOpen, item]);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof ProductionItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.netWeight || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      totalWeight,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSave(formData);
      if (typeof result === "boolean" ? result : true) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving production:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Edit Production" : "New Production Entry"}
      size="xl"
    >
      {initialLoading ? (
        <div className="p-6">
          {/* spinner instead */}
          <Spinner/>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice No
              </label>
              <input
                name="invoiceNo"
                value={formData.invoiceNo || ""}
                onChange={handleInputChange}
                className="input-base"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                name="date"
                type="date"
                value={
                  (formData.date as string) ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={handleInputChange}
                className="input-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="input-base h-24"
            />
          </div>

          {/* Production Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Production Items
            </h3>

            {formData.items && formData.items.length ? (
              <div className="space-y-4">
                {formData.items.map((it, index) => {
                  const product = products.find((p) => p.id === it.productId);
                  return (
                    <div key={it.id} className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={it.categoryId}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "categoryId",
                              e.target.value
                            )
                          }
                          className="input-base"
                          required
                          disabled={loading}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product
                        </label>
                        <div className="input-base bg-gray-50 flex items-center text-gray-700">
                          {product ? product.name : it.productId}
                        </div>
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Godown
                        </label>
                        <select
                          value={it.godownId}
                          onChange={(e) =>
                            handleItemChange(index, "godownId", e.target.value)
                          }
                          className="input-base"
                          required
                          disabled={loading}
                        >
                          <option value="">Select godown</option>
                          {godowns.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-6 md:col-span-1.5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={it.quantity ?? 0}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="input-base"
                          min="0"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="col-span-6 md:col-span-1.5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={it.netWeight ?? 0}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "netWeight",
                              Number(e.target.value)
                            )
                          }
                          className="input-base"
                          min="0"
                          step="0.01"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No items to display.</div>
            )}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Quantity
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(formData.totalQuantity || 0, 0)} Bags
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Weight
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(formData.totalWeight || 0, 2)} Kg
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} loading={loading}>
              {item ? "Update Production" : "Create Production"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ProductionFormModal;
