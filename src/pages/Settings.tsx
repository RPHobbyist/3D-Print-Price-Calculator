import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Printer, Package } from "lucide-react";
import MaterialsManager from "@/components/settings/MaterialsManager";
import MachinesManager from "@/components/settings/MachinesManager";
import ConstantsManager from "@/components/settings/ConstantsManager";
import SettingsExportImport from "@/components/settings/SettingsExportImport";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import { Footer } from "@/components/Footer";
import { CurrencySelector } from "@/components/CurrencySelector";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://linktr.ee/RPHobbyist" target="_blank" rel="noopener noreferrer" className="hover-lift flex-shrink-0">
                <img src={logo} alt="Rp Hobbyist" className="h-16 max-w-80 w-auto object-contain" />
              </a>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings & Database</h1>
                <p className="text-sm text-muted-foreground">
                  by <a href="https://linktr.ee/RPHobbyist" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Rp Hobbyist</a> • Manage materials, machines, and constants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector />
              <NavLink to="/">Back to Calculator</NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative space-y-6">
        <Card className="shadow-elevated border-border bg-card overflow-hidden animate-fade-in hover-glow">
          <Tabs defaultValue="materials" className="w-full">
            <div className="border-b border-border px-6 pt-6">
              <TabsList className="bg-secondary/50 p-1.5 rounded-xl">
                <TabsTrigger
                  value="materials"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-5 py-2.5 transition-all duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Materials
                </TabsTrigger>
                <TabsTrigger
                  value="machines"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-5 py-2.5 transition-all duration-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Machines
                </TabsTrigger>
                <TabsTrigger
                  value="constants"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-5 py-2.5 transition-all duration-200"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Consumables
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="materials" className="p-6 mt-0 animate-fade-in">
              <MaterialsManager />
            </TabsContent>

            <TabsContent value="machines" className="p-6 mt-0 animate-fade-in">
              <MachinesManager />
            </TabsContent>

            <TabsContent value="constants" className="p-6 mt-0 animate-fade-in">
              <ConstantsManager />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Export/Import Section */}
        <SettingsExportImport />
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

