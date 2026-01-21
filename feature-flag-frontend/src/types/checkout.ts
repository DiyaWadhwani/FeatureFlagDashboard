type Item = {
  name: string;
  price: number;
};

type LegacyCheckout = {
  version: "v1";
  items: Item[];
  shipping: number;
  total: number;
  message: string;
};

type NewCheckout = {
  version: "v2";
  items: Item[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  message: string;
};

export type CheckoutResponse = LegacyCheckout | NewCheckout;
