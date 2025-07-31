import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { recipes } from "@/mocks/demoData";
import { BookOpen, Play, Star, TrendingUp, Clock, Target } from "lucide-react";

export function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500";
      case "Médio": return "bg-yellow-500";
      case "Avançado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const RecipeCard = ({ recipe }: { recipe: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {recipe.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {recipe.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(recipe.difficulty)}`} />
            <span>{recipe.difficulty}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{recipe.expectedROI}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Métricas Esperadas:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="flex justify-between">
                <span>Open Rate</span>
                <span>{(recipe.metrics.openRate * 100).toFixed(0)}%</span>
              </div>
              <Progress value={recipe.metrics.openRate * 100} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between">
                <span>Click Rate</span>
                <span>{(recipe.metrics.clickRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={recipe.metrics.clickRate * 100} className="h-1" />
            </div>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {recipe.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setSelectedRecipe(recipe)}
              >
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{recipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações</h4>
                    <div className="space-y-1 text-sm">
                      <div>Categoria: {recipe.category}</div>
                      <div>Dificuldade: {recipe.difficulty}</div>
                      <div>Duração: {recipe.duration}</div>
                      <div>ROI Esperado: {recipe.expectedROI}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Métricas</h4>
                    <div className="space-y-2">
                      {Object.entries(recipe.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('Rate', ' Rate')}</span>
                          <span>{((value as number) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cronograma de Emails</h4>
                  <div className="space-y-2">
                    {recipe.steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">Dia {step.day}:</span> {step.email}
                        </div>
                        <Badge variant="outline">CTR {(step.ctr * 100).toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Aplicar Receita
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Biblioteca de Receitas</h1>
            <p className="text-muted-foreground">
              Templates prontos para campanhas de email marketing
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Star className="w-4 h-4 mr-2" />
          Favoritas
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance das Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <div className="font-medium">{recipe.name}</div>
                  <div className="text-sm text-muted-foreground">{recipe.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{recipe.expectedROI}</div>
                  <div className="text-sm text-muted-foreground">ROI Esperado</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}