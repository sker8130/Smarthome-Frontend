// import RealtimeChart from "@/components/dashboard/RealtimeChart";

// export default function Page() {
//   return (
//     <div className="max-w-xl">
//       <RealtimeChart/>
//     </div>
//   );
// }


"use client";

import RealtimeChartFake from "@/components/dashboard/RealtimeChartFake"

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      {/* đoạn card thiết bị: đèn / quạt / loa của bạn ở trên */}
      
      <RealtimeChartFake />
    </main>
  );
}
