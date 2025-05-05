import Footer from "@components/Footer";
import Nav from "@components/Nav";
import "@styles/globals.css";
import Provider from "@components/Provider";
import React from "react";

export const metadata = {
  title: "Baby Store",
  description: "An e-commerce site for baby products",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body className="font-sans min-h-screen" suppressHydrationWarning={true}>
      <Provider>
        <div className="main bg-primary-darkest"></div>
        <main className="app bg-primary-darkest flex flex-col min-h-screen">
          <Nav />
          <div className="flex-grow w-full">{children}</div>
          <Footer />
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
