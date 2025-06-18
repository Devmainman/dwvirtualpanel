// src/components/charts/LineChartPlaceholder.jsx
import { BarChart2 } from "lucide-react";

export default function LineChartPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center">
        <BarChart2 size={48} className="text-gray-300" />
        <p className="text-gray-400 mt-2">Chart Placeholder</p>
      </div>
    </div>
  );
}