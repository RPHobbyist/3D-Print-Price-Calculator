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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-accent p-3 rounded-xl shadow-card">
                <SettingsIcon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings & Database</h1>
                <p className="text-sm text-muted-foreground">Manage materials, machines, and constants</p>
              </div>
            </div>
            <NavLink to="/">Back to Calculator</NavLink>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-elevated border-border bg-card">
          <Tabs defaultValue="materials" className="w-full">
            <div className="border-b border-border px-6 pt-6">
              <TabsList className="bg-secondary">
                <TabsTrigger value="materials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Package className="w-4 h-4 mr-2" />
                  Materials
                </TabsTrigger>
                <TabsTrigger value="machines" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Printer className="w-4 h-4 mr-2" />
                  Machines
                </TabsTrigger>
                <TabsTrigger value="constants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Database className="w-4 h-4 mr-2" />
                  Constants
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="materials" className="p-6 mt-0">
              <MaterialsManager />
            </TabsContent>

            <TabsContent value="machines" className="p-6 mt-0">
              <MachinesManager />
            </TabsContent>

            <TabsContent value="constants" className="p-6 mt-0">
              <ConstantsManager />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
