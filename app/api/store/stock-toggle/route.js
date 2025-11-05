import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/app/middlewares/authSeller";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "missing details: productId" },
        { status: 400 }
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        inStock: !product.inStock,
      },
    });

    return NextResponse.json({ status: "Product stock updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || error.code },
      { status: 500 }
    );
  }
}
