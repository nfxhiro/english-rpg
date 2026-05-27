"use client";
import type { ReactNode } from "react";
import CommonGameNav from "./CommonGameNav";

export default function PageTopBar({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`eq-topbar page-top-bar${className ? ` ${className}` : ""}`}>
      <CommonGameNav />
      {children != null && (
        <div className="page-top-bar__right">{children}</div>
      )}
    </div>
  );
}
