"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, HelpCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getFaqs, updateFaqs } from "@/services/faq.services";

interface FaqRow {
  key: string;
  question: string;
  answer: string;
  isActive: boolean;
}

const createRow = (
  question = "",
  answer = "",
  isActive = true,
): FaqRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  question,
  answer,
  isActive,
});

export default function FaqManagerPage() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<FaqRow[]>([]);

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => getFaqs(),
  });

  useEffect(() => {
    if (faqsData?.data) {
      setRows(
        faqsData.data.map((faq) =>
          createRow(faq.question, faq.answer, faq.isActive),
        ),
      );
    }
  }, [faqsData]);

  const { mutate: saveFaqs, isPending: isSaving } = useMutation({
    mutationFn: updateFaqs,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "FAQs updated successfully");
        void queryClient.invalidateQueries({ queryKey: ["faqs"] });
      } else {
        toast.error(res.message || "Failed to update FAQs");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const handleAddRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleRemoveRow = (key: string) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const handleQuestionChange = (key: string, question: string) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, question } : row)),
    );
  };

  const handleAnswerChange = (key: string, answer: string) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, answer } : row)),
    );
  };

  const handleActiveChange = (key: string, isActive: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, isActive } : row)),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const faqs = rows
      .filter((row) => row.question.trim())
      .map((row) => ({
        question: row.question,
        answer: row.answer,
        isActive: row.isActive,
      }));
    saveFaqs({ faqs });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
        <p className="text-muted-foreground">
          Manage the FAQs shown on the storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">FAQs</h4>
          </div>

          <div className="space-y-4">
            {rows.length === 0 ? (
              <div className="flex h-32 items-center justify-center border border-dashed rounded-xl">
                <p className="text-muted-foreground">
                  No FAQs added yet. Add one to get started.
                </p>
              </div>
            ) : (
              rows.map((row, index) => (
                <div
                  key={row.key}
                  className="rounded-xl border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      FAQ #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveRow(row.key)}
                      className="rounded-xl shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`question-${row.key}`}>Question</Label>
                    <Input
                      id={`question-${row.key}`}
                      value={row.question}
                      onChange={(e) =>
                        handleQuestionChange(row.key, e.target.value)
                      }
                      placeholder="e.g. How do I track my order?"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`answer-${row.key}`}>Answer</Label>
                    <Textarea
                      id={`answer-${row.key}`}
                      value={row.answer}
                      onChange={(e) =>
                        handleAnswerChange(row.key, e.target.value)
                      }
                      placeholder="Write the answer…"
                      className="rounded-xl min-h-24"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`active-${row.key}`}
                      checked={row.isActive}
                      onCheckedChange={(checked) =>
                        handleActiveChange(row.key, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`active-${row.key}`}
                      className="font-normal"
                    >
                      Active (publicly visible)
                    </Label>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 px-8 rounded-full font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update FAQs"
          )}
        </Button>
      </form>
    </div>
  );
}
