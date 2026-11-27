import { Suspense } from "react";

import { AuthGuard } from "./auth-guard";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6ECDF] lg:flex-row">
      {/* AuthGuard reads cookies (runtime API) so it lives inside Suspense
          per the cacheComponents pattern (see specs/09 step 3). */}
      <Suspense fallback={null}>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </div>
  );
}
