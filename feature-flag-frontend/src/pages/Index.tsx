import { FeatureFlagsTable } from "@/components/FeatureFlagsTable";
import { Flag } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-muted">
              <Flag className="h-5 w-5 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Feature Flags
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Control runtime features without redeploying code
          </p>
        </header>

        {/* Table */}
        <main>
          <FeatureFlagsTable />
        </main>

        {/* Footer info */}
        <footer className="mt-6 text-xs text-muted-foreground">
          {8} feature flags configured
        </footer>
      </div>
    </div>
  );
};

export default Index;
