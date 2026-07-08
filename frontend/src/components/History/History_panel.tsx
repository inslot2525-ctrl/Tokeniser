import { Clock, ArrowRight } from "lucide-react";
import { useHistory } from "../../context/HistoryContext";

export default function HistoryPanel() {
  const { history } = useHistory();

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      <h2 className="mb-8 text-2xl font-bold">Recent Prompts</h2>

      <div className="space-y-6">
        {history.length === 0 && (
          <div className="text-gray-500">No history yet</div>
        )}

        {history.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[#181818] p-5">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{item.route}</div>
                <div className="text-sm text-gray-500">{item.model}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={15} />
                {item.timestamp}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-300">{item.prompt}</div>

            <div className="flex justify-center py-3">
              <ArrowRight />
            </div>

            <div className="text-orange-400">{item.optimized}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
