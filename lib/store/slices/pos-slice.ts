import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** One line on the POS ticket — a specific size/colour, priced as the shop quotes it. */
export type PosLine = {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  /** Stock when the line was added — caps the quantity stepper. */
  stock: number;
  image: string | null;
};

export type PosCustomer = { name: string; phone: string; email: string };

export type PosState = {
  lines: PosLine[];
  customer: PosCustomer;
  paymentMethod: string;
  transactionId: string;
  couponCode: string;
  /** Staff-granted reduction, in shop currency. */
  discount: number;
  note: string;
};

export const initialPosState: PosState = {
  lines: [],
  customer: { name: "", phone: "", email: "" },
  paymentMethod: "cash",
  transactionId: "",
  couponCode: "",
  discount: 0,
  note: "",
};

const clamp = (quantity: number, stock: number) => Math.max(1, Math.min(Math.floor(quantity) || 1, Math.max(stock, 1)));

/** The in-store sale being rung up (admin POS). Cleared after checkout. */
export const posSlice = createSlice({
  name: "pos",
  initialState: initialPosState,
  reducers: {
    addLine(state, action: PayloadAction<Omit<PosLine, "quantity"> & { quantity?: number }>) {
      const existing = state.lines.find((line) => line.variantId === action.payload.variantId);
      const quantity = action.payload.quantity ?? 1;
      if (existing) existing.quantity = clamp(existing.quantity + quantity, existing.stock);
      else state.lines.push({ ...action.payload, quantity: clamp(quantity, action.payload.stock) });
    },
    setLineQuantity(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const line = state.lines.find((row) => row.variantId === action.payload.variantId);
      if (line) line.quantity = clamp(action.payload.quantity, line.stock);
    },
    removeLine(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.variantId !== action.payload);
    },
    setCustomerField(state, action: PayloadAction<{ field: keyof PosCustomer; value: string }>) {
      state.customer[action.payload.field] = action.payload.value;
    },
    setPaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    setTransactionId(state, action: PayloadAction<string>) {
      state.transactionId = action.payload;
    },
    setCouponCode(state, action: PayloadAction<string>) {
      state.couponCode = action.payload;
    },
    setDiscount(state, action: PayloadAction<number>) {
      state.discount = Number.isFinite(action.payload) && action.payload > 0 ? action.payload : 0;
    },
    setNote(state, action: PayloadAction<string>) {
      state.note = action.payload;
    },
    resetSale() {
      return initialPosState;
    },
  },
  selectors: {
    selectPos: (state) => state,
    selectPosLines: (state) => state.lines,
  },
});

export const posActions = posSlice.actions;
export const { selectPos, selectPosLines } = posSlice.selectors;
