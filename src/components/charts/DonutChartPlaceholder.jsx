// src/components/charts/DonutChartPlaceholder.jsx
import { PieChart } from "lucide-react";

export default function DonutChartPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center">
        <PieChart size={48} className="text-gray-300" />
        <p className="text-gray-400 mt-2">Chart Placeholder</p>
      </div>
    </div>
  );
}