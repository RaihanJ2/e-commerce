import Footer from "@components/Footer";
import Nav from "@components/nav";
import "@styles/globals.css";
import { Inter } from "next/font/google";
import Provider from "@components/Provider";
import React from "react";

export const metadata = {
  title: "Baby Store",
  description: "An e-commerce site for baby products",
};

const inter = Inter({ subsets: ["latin"] });

const RootLayout = ({ children }) => (
  <html lang="en">
    <body className={`${inter.className}`} suppressHydrationWarning={true}>
      <Provider>
        <div className="main"></div>
        <main className="app">
          <Nav />
          {children}
          <Footer />
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
