import { useEffect, useState } from "react";
import { useConfig } from "../hooks/useConfig";

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

type CheckoutResponse = LegacyCheckout | NewCheckout;

export default function Checkout() {
  const { config, loading: configLoading } = useConfig();
  const [data, setData] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const checkoutEndpoint = config?.new_checkout_flow
    ? "http://localhost:3000/checkout/experience?version=v2"
    : "http://localhost:3000/checkout/experience?version=v1";

  useEffect(() => {
    fetch(checkoutEndpoint)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [checkoutEndpoint]);

  if (loading || configLoading)
    return <div className="p-6">Loading checkout…</div>;
  if (!data)
    return <div className="p-6 text-red-500">Failed to load checkout.</div>;

  const discountRate =
    data.version === "v2" ? data.discount / data.subtotal : 0;

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-3xl font-bold">
          {data.version === "v2"
            ? "New Checkout Experience"
            : "Legacy Checkout"}
        </h1>

        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full inline-block
            ${
              data.version === "v2"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {data.version === "v2" ? "Feature Flag ON" : "Feature Flag OFF"}
          </span>

          <p className="text-sm text-muted-foreground">{data.message}</p>

          {/* Items */}
          <div className="border-t pt-4 space-y-3 text-sm">
            {data.items.map((item) => {
              const discountedPrice =
                data.version === "v2"
                  ? Math.round(item.price * (1 - discountRate))
                  : item.price;

              return (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}</span>

                  {data.version === "v2" && config?.new_checkout_flow ? (
                    <span>
                      <span className="line-through text-muted-foreground mr-2">
                        ${item.price}
                      </span>
                      <span className="font-medium text-green-700">
                        ${discountedPrice}
                      </span>
                    </span>
                  ) : (
                    <span>${item.price}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2 text-sm">
            {data.version === "v2" && (
              <>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${data.subtotal}</span>
                </div>

                <div className="flex justify-between text-green-600 font-medium">
                  <span>Holiday Discount</span>
                  <span>- ${data.discount}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {data.version === "v2" && config?.new_checkout_flow ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  `$${data.shipping}`
                )}
              </span>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>${data.total}</span>
            </div>
          </div>

          <button className="w-full mt-4 rounded-md bg-primary text-primary-foreground py-2 font-medium">
            Place Order
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Checkout behavior controlled via Feature Flags
        </p>
      </div>
    </div>
  );
}
