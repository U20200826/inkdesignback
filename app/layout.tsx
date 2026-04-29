import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    title: "INK Management",
    description: "INK business management system",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html
            lang="en" className="antialiased">
        <body>{children}</body>
        </html>
    );
}
