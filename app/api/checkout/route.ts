import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, items, shippingAddress, paymentMethod, subtotal, shippingCost, total } = body;

  if (!email || !items || !shippingAddress || !paymentMethod || total === undefined) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const session = await safeAuth();

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: session?.user?.id ?? null,
      email,
      status: "pending",
      items,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      subtotal,
      shipping_cost: shippingCost ?? 0,
      total,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "order_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, order });
}
