import React from "react";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap";
import "@payloadcms/next/css";
import config from "@payload-config";
import type { ServerFunctionClient } from "payload";

export const metadata = {
  title: "Ele's Cookies — Admin",
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
