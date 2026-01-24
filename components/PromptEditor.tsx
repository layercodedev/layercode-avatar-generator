"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Prompt {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
  isPetMode: boolean;
}

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  prompts: Prompt[];
  onSavePrompt: (name: string, content: string) => void;
  onLoadPrompts: () => void;
  onPetModeChange?: (isPetMode: boolean) => void;
}

export function PromptEditor({
  value,
  onChange,
  prompts,
  onSavePrompt,
  onLoadPrompts,
  onPetModeChange,
}: PromptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPromptName, setNewPromptName] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    onLoadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default prompt on initial load only
  useEffect(() => {
    if (hasInitialized.current) return;
    const defaultPrompt = prompts.find((p) => p.isDefault);
    if (defaultPrompt && !value) {
      hasInitialized.current = true;
      onChange(defaultPrompt.content);
      setSelectedPromptId(defaultPrompt.id);
      onPetModeChange?.(defaultPrompt.isPetMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompts]);

  const handleSelectPrompt = useCallback((promptId: number) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (prompt) {
      onChange(prompt.content);
      setSelectedPromptId(promptId);
      onPetModeChange?.(prompt.isPetMode);
    }
  }, [prompts, onChange, onPetModeChange]);

  const handleSave = useCallback(() => {
    if (newPromptName.trim()) {
      onSavePrompt(newPromptName.trim(), value);
      setNewPromptName("");
      setShowSaveDialog(false);
    }
  }, [newPromptName, onSavePrompt, value]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="aqua-label shrink-0">Prompt</label>
        <select
          value={selectedPromptId || ""}
          onChange={(e) => handleSelectPrompt(Number(e.target.value))}
          className="aqua-select flex-1"
        >
          <option value="">Select a saved prompt...</option>
          {prompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.name} {prompt.isDefault ? "(Default)" : ""}{prompt.isPetMode ? " 🐾" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="aqua-button"
        >
          {isEditing ? "Collapse" : "Edit"}
        </button>
      </div>

      {isEditing && (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSelectedPromptId(null);
            }}
            rows={8}
            className="aqua-textarea w-full"
            placeholder="Enter your prompt..."
          />
          <div className="flex justify-end gap-2">
            {showSaveDialog ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="Prompt name"
                  className="aqua-input"
                  autoFocus
                />
                <button onClick={handleSave} className="aqua-button aqua-button-primary">
                  Save
                </button>
                <button onClick={() => setShowSaveDialog(false)} className="aqua-button">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSaveDialog(true)} className="aqua-button">
                Save as New Prompt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
