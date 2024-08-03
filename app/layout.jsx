import Footer from "@components/Footer";
import Nav from "@components/nav";
import "@styles/globals.css";
import Provider from "@components/Provider";
import React from "react";

export const metadata = {
  title: "Baby Store",
  description: "An e-commerce site for baby products",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body className="font-sans" suppressHydrationWarning={true}>
      <Provider>
        <div className="main bg-main"></div>
        <main className="app bg-main">
          <Nav />
          {children}
          <Footer />
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
