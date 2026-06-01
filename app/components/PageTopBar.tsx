"use client";
import type { ReactNode } from "react";
import CommonGameNav from "./CommonGameNav";

export default function PageTopBar({
  children,
  className,
  onQuestClick,
}: {
  children?: ReactNode;
  className?: string;
  onQuestClick?: () => void;
}) {
  return (
    <div className={`eq-topbar page-top-bar${className ? ` ${className}` : ""}`}>
      <CommonGameNav onQuestClick={onQuestClick} />
      {children != null && (
        <div className="page-top-bar__right">{children}</div>
      )}
    </div>
  );
}
