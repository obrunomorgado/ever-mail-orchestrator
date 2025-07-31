import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fields = [
  { value: "last_purchase", label: "Última Compra" },
  { value: "total_spent", label: "Total Gasto" },
  { value: "order_count", label: "Número de Pedidos" },
  { value: "avg_order_value", label: "Ticket Médio" },
  { value: "days_since_signup", label: "Dias Desde Cadastro" },
  { value: "category_preference", label: "Categoria Preferida" },
];

const operators = [
  { value: "greater_than", label: "Maior que" },
  { value: "less_than", label: "Menor que" },
  { value: "equals", label: "Igual a" },
  { value: "contains", label: "Contém" },
  { value: "within_days", label: "Nos últimos X dias" },
];

export function SmartTagBuilder() {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [tagName, setTagName] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!field || !operator || !value || !tagName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a tag.",
        variant: "destructive",
      });
      return;
    }

    // Mock save - just show success message
    toast({
      title: "Tag criada com sucesso!",
      description: `Tag "${tagName}" foi criada com a regra: ${field} ${operator} ${value}`,
    });

    // Reset form
    setField("");
    setOperator("");
    setValue("");
    setTagName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Criar Tag Automática
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Tag Inteligente</DialogTitle>
          <DialogDescription>
            Configure uma regra automática para aplicar tags aos seus contatos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tag-name">Nome da Tag</Label>
            <Input
              id="tag-name"
              placeholder="Ex: clientes_vip"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="field">Campo</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um campo" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="operator">Operador</Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um operador" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              placeholder="Ex: 500, 30, eletrônicos"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Salvar Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}