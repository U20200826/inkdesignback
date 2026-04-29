// Products page — passes session user to client for role-based permissions
 import {redirect} from "next/navigation";
 import {getSession} from "@/lib/session/session.server";
import {getProducts} from "@/lib/products";
import ProductsClient from "@/components/products/ProductsClient";

export default async function ProductsPage() {

     const user = await getSession();

     if (!user) redirect("/login");

    const products = await getProducts();

    return <ProductsClient products={products} user={user} />;

}