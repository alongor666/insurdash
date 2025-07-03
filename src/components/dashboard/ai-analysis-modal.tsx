"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export default function AiAnalysisModal({ isOpen, onClose, content }: AiAnalysisModalProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      toast({ title: "已复制到剪贴板" });
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }, () => {
      toast({ title: "复制失败", variant: "destructive" });
    });
  };

  const handleSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    const textarea = (e.target as HTMLElement).closest('.modal-content')?.querySelector('textarea');
    textarea?.focus();
    textarea?.select();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl modal-content">
        <DialogHeader>
          <DialogTitle>AI 辅助分析</DialogTitle>
          <DialogDescription>
            已为您生成结构化的分析材料。请复制以下内容并粘贴到您常用的大语言模型工具（如 Kimi, Gemini, ChatGPT 等）中进行深度分析。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-96 rounded-md border">
            <Textarea
              readOnly
              value={content}
              className="h-96 w-full resize-none border-0 focus-visible:ring-0"
            />
          </ScrollArea>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleSelectAll}>
            全选
          </Button>
          <Button type="button" onClick={handleCopy}>
            {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {hasCopied ? "已复制" : "一键复制"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
