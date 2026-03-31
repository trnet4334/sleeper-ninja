import { useContext } from "react";
import { CategoryContext } from "@/components/layout/category-context";

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryContext must be used within CategoryProvider");
  }
  return context;
}
