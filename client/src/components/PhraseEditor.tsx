/**
 * Editor de Frases com Tradução Simultânea
 * Sugestões: "Modifique esta palavra", "Acrescente outra"
 * Tradução em tempo real ao digitar
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Plus, Edit, Languages, Sparkles, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";

interface PhraseEditorProps {
  targetLanguage: string;
  nativeLanguage: string;
  initialPhrase?: string;
}

export default function PhraseEditor({
  targetLanguage,
  nativeLanguage,
  initialPhrase = "",
}: PhraseEditorProps) {
  const [phrase, setPhrase] = useState(initialPhrase);
  const [translation, setTranslation] = useState("");
  const [wordByWord, setWordByWord] = useState<{ word: string; translation: string }[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState("");

  // Mutations
  const translateRealtime = trpc.conversationAI.translateRealtime.useMutation();
  const editPhrase = trpc.conversationAI.editPhrase.useMutation();
  const addToVocabulary = trpc.conversationAI.addToVocabulary.useMutation();

  // Tradução em tempo real (debounced)
  useEffect(() => {
    if (!phrase.trim()) {
      setTranslation("");
      setWordByWord([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await translateRealtime.mutateAsync({
          text: phrase,
          fromLanguage: targetLanguage,
          toLanguage: nativeLanguage,
        });

        setTranslation(result.translation);
        setWordByWord(result.wordByWord);
      } catch (error) {
        console.error("Translation error:", error);
      }
    }, 500); // Delay de 500ms

    return () => clearTimeout(timer);
  }, [phrase, targetLanguage, nativeLanguage]);

  const handleModifyWord = async () => {
    if (!selectedWord) {
      toast.error("Selecione uma palavra primeiro");
      return;
    }

    try {
      const result = await editPhrase.mutateAsync({
        originalPhrase: phrase,
        targetLanguage,
        nativeLanguage,
        editType: "modify_word",
        wordToModify: selectedWord,
      });

      setSuggestions(result.suggestions);
      toast.success("Sugestões carregadas!");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Erro ao buscar sugestões");
    }
  };

  const handleAddWord = async () => {
    try {
      const result = await editPhrase.mutateAsync({
        originalPhrase: phrase,
        targetLanguage,
        nativeLanguage,
        editType: "add_word",
      });

      setSuggestions(result.suggestions);
      toast.success("Sugestões carregadas!");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Erro ao buscar sugestões");
    }
  };

  const handleImprove = async () => {
    try {
      const result = await editPhrase.mutateAsync({
        originalPhrase: phrase,
        targetLanguage,
        nativeLanguage,
        editType: "improve",
      });

      setSuggestions(result.suggestions);
      toast.success("Sugestões de melhoria carregadas!");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Erro ao buscar sugestões");
    }
  };

  const handleAddToVocabulary = async (word: string, trans: string) => {
    try {
      await addToVocabulary.mutateAsync({
        word,
        translation: trans,
        targetLanguage,
        nativeLanguage,
        exampleSentence: phrase,
      });

      toast.success(`"${word}" adicionado ao vocabulário!`);
    } catch (error) {
      console.error("Vocabulary error:", error);
      toast.error("Erro ao adicionar palavra");
    }
  };

  return (
    <div className="space-y-4">
      {/* Input de Frase */}
      <Card className="p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Digite sua frase em {targetLanguage}:
          </label>
          <Input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={`Type in ${targetLanguage}...`}
            className="text-lg"
          />
        </div>

        {/* Tradução em Tempo Real */}
        {translation && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Tradução:</span>
            </div>
            <p className="text-lg">{translation}</p>
          </div>
        )}

        {/* Palavra por Palavra */}
        {wordByWord.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Palavra por palavra:</p>
            <div className="flex flex-wrap gap-2">
              {wordByWord.map((item, idx) => (
                <Badge
                  key={idx}
                  variant={selectedWord === item.word ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setSelectedWord(item.word)}
                >
                  <span className="font-semibold">{item.word}</span>
                  <span className="mx-1">=</span>
                  <span>{item.translation}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToVocabulary(item.word, item.translation);
                    }}
                  >
                    <BookmarkPlus className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={handleModifyWord}
          disabled={!selectedWord || editPhrase.isPending}
          className="flex items-center gap-2"
        >
          {editPhrase.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
          Modificar Palavra
        </Button>

        <Button
          variant="outline"
          onClick={handleAddWord}
          disabled={!phrase.trim() || editPhrase.isPending}
          className="flex items-center gap-2"
        >
          {editPhrase.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Acrescentar Palavra
        </Button>

        <Button
          variant="outline"
          onClick={handleImprove}
          disabled={!phrase.trim() || editPhrase.isPending}
          className="flex items-center gap-2"
        >
          {editPhrase.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Melhorar Frase
        </Button>
      </div>

      {/* Sugestões */}
      {suggestions && (
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Sugestões:
          </h4>
          <div className="whitespace-pre-wrap text-sm">{suggestions}</div>
        </Card>
      )}
    </div>
  );
}
