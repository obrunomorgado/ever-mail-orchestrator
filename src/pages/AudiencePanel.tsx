import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { GuardrailsBanner } from "@/components/GuardrailsBanner";
import { BestTimeWidget } from "@/components/BestTimeWidget";
import { BackupToggle } from "@/components/BackupToggle";
import { SmartTagBuilder } from "@/components/SmartTagBuilder";
import { RFMMatrixWidget } from "@/components/RFMMatrixWidget";
import { segments, tags, lists, guardrailsData } from "@/mocks/demoData";
import { Users, Tag, List, Calendar, TrendingUp, BarChart } from "lucide-react";

export function AudiencePanel() {
  const { tipo } = useParams<{ tipo: string }>();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data, title, icon: Icon } = useMemo(() => {
    switch (tipo) {
      case "segmentos":
        return { data: segments, title: "Segmentos de Audiência", icon: Users };
      case "tags":
        return { data: tags, title: "Tags Inteligentes", icon: Tag };
      case "listas":
        return { data: lists, title: "Listas de Contatos", icon: List };
      default:
        return { data: [], title: "Audiências", icon: Users };
    }
  }, [tipo]);

  const automaticData = data.filter(item => item.auto);
  const manualData = data.filter(item => !item.auto);

  const formatMetric = (item: any) => {
    if (tipo === "segmentos") {
      return `${item.size.toLocaleString()} contatos • CTR ${(item.ctr * 100).toFixed(1)}%`;
    }
    if (tipo === "tags") {
      return `${item.applied.toLocaleString()} aplicações`;
    }
    if (tipo === "listas") {
      return `${item.size.toLocaleString()} contatos • Origem: ${item.origin}`;
    }
    return "";
  };

  const ItemCard = ({ item }: { item: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant={item.auto ? "default" : "secondary"}>
            {item.auto ? "Automático" : "Manual"}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {formatMetric(item)}
        </CardDescription>
        {tipo === "segmentos" && item.erpm && (
          <Badge 
            variant={item.erpm > 0.18 ? "default" : item.erpm > 0.1 ? "secondary" : "destructive"}
            className="mt-2 w-fit"
          >
            eRPM R${item.erpm.toFixed(2)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {item.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.rfm && (
              <Badge variant="outline" className="text-xs">
                RFM: {item.rfm}
              </Badge>
            )}
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedItem(item)}
              >
                Detalhes
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-2xl mx-auto">
              <DrawerHeader>
                <DrawerTitle>{item.name}</DrawerTitle>
              </DrawerHeader>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações Gerais</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-4">
                    {tipo === "segmentos" && (
                      <>
                        <BestTimeWidget audienceId={item.id} />
                        <RFMMatrixWidget segmentId={item.id} />
                      </>
                    )}
                    <BackupToggle />
                    
                    {tipo === "segmentos" && (
                      <div className="pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full">
                          <BarChart className="w-3 h-3 mr-2" />
                          Comparar com Outro Segmento
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">
              Gerencie e monitore suas {tipo?.toLowerCase()}
            </p>
          </div>
        </div>
        {tipo === "tags" && <SmartTagBuilder />}
      </div>

      <GuardrailsBanner 
        spamRate={guardrailsData.spamRate}
        bounceRate={guardrailsData.bounceRate}
        unsubscribeRate={guardrailsData.unsubscribeRate}
      />

      <Tabs defaultValue="automaticos" className="w-full">
        <TabsList>
          <TabsTrigger value="automaticos">
            Automáticos ({automaticData.length})
          </TabsTrigger>
          <TabsTrigger value="manuais">
            Manuais ({manualData.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="automaticos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {automaticData.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="manuais" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {manualData.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}