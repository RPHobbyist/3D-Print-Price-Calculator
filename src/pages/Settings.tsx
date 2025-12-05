import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Database, Printer, Package } from "lucide-react";
import MaterialsManager from "@/components/settings/MaterialsManager";
import MachinesManager from "@/components/settings/MachinesManager";
import ConstantsManager from "@/components/settings/ConstantsManager";
import { NavLink } from "@/components/NavLink";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-accent p-3 rounded-2xl shadow-elevated hover-lift">
                <SettingsIcon className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings & Database</h1>
                <p className="text-sm text-muted-foreground">Manage materials, machines, and constants</p>
              </div>
            </div>
            <NavLink to="/">Back to Calculator</NavLink>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
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
                  Constants
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
      </main>
    </div>
  );
};

export default Settings;
