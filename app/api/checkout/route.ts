import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { findProductById } from "@/lib/data";
import { nextOrderNumber } from "@/lib/orders/orderNumber";
import { getMarket } from "@/i18n/markets";
import { getShippingConfig } from "@/lib/shipping/config";

interface CheckoutItemInput {
  id: string;
  quantity: number;
}

interface ShippingAddressInput {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  province: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
}

const MAX_ORDER_NUMBER_RETRIES = 3;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, items, shippingAddress } = body as {
    email?: string;
    items?: CheckoutItemInput[];
    shippingAddress?: ShippingAddressInput;
  };

  if (!email || !items?.length || !shippingAddress) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const { fullName, phone, country, city, province, addressLine1, addressLine2, postalCode } = shippingAddress;
  if (!fullName || !phone || !country || !city || !addressLine1 || !postalCode) {
    return NextResponse.json({ error: "missing_shipping_fields" }, { status: 400 });
  }

  // Prices come from the server's own catalog, never the client — the
  // previous version of this route trusted a client-supplied `price` per
  // item, which is a straightforward way for a shopper to check out at
  // whatever total they want.
  const resolvedItems = items.map((item) => {
    const product = findProductById(item.id);
    return product ? { product, quantity: item.quantity } : null;
  });
  if (resolvedItems.some((item) => item === null) || resolvedItems.length === 0) {
    return NextResponse.json({ error: "invalid_items" }, { status: 400 });
  }
  const validItems = resolvedItems as { product: NonNullable<ReturnType<typeof findProductById>>; quantity: number }[];

  const subtotal = validItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  // CJ's IOSS-scheme threshold: an EU-bound order's goods value (not
  // shipping) must stay under the configured EUR limit, or it needs full
  // customs clearance instead of VAT-at-checkout. Client-side warns about
  // this before submit, but that's UX only — this is the real gate, since
  // this route can be called directly.
  const market = getMarket(country);
  if (market.euMember) {
    const { euOrderLimitEur, usdToEurRate } = await getShippingConfig();
    const subtotalEur = subtotal * usdToEurRate;
    if (subtotalEur > euOrderLimitEur) {
      return NextResponse.json(
        {
          error: "eu_order_limit_exceeded",
          message: `AB ölkələrinə hər sifarişin ümumi dəyəri ${euOrderLimitEur} avrodan aşağı olmalıdır (gömrük qaydaları). Zəhmət olmasa səbətinizi bölün və ayrı-ayrı sifariş verin.`,
          limitEur: euOrderLimitEur,
        },
        { status: 400 }
      );
    }
  }

  const address = addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1;

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_RETRIES; attempt++) {
    try {
      const orderNumber = await nextOrderNumber();
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          shippingCountry: country,
          shippingProvince: province,
          shippingCity: city,
          shippingAddress: address,
          shippingPostalCode: postalCode,
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          shippingCost: new Prisma.Decimal(shippingCost.toFixed(2)),
          total: new Prisma.Decimal(total.toFixed(2)),
          status: "PENDING_PAYMENT",
          items: {
            create: validItems.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              variantColor: product.colors[0],
              quantity,
              unitPrice: new Prisma.Decimal(product.price.toFixed(2)),
            })),
          },
          statusHistory: {
            create: { status: "PENDING_PAYMENT", note: "Order created, awaiting payment" },
          },
        },
      });

      return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
    } catch (err) {
      // Unique constraint on orderNumber — another request grabbed the
      // same number between our count and insert; retry with a fresh one.
      const isUniqueConflict = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isUniqueConflict || attempt === MAX_ORDER_NUMBER_RETRIES - 1) {
        return NextResponse.json({ error: "order_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "order_failed" }, { status: 500 });
}
