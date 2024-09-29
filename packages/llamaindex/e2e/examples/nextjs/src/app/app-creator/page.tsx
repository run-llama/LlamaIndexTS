"use client";

import { run } from "@/actions/app-creator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";

const defaultSpecification = `Python app that takes user questions and looks them up in a 
database where they are mapped to answers. If there is a close match, it retrieves 
the matched answer. If there isn't, it asks the user to provide an answer and 
stores the question/answer pair in the database.`;

export default function AppCreator() {
  const [specification, setSpecification] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ui, setUi] = useState<ReactNode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specification.trim()) {
      setError("Please enter a description for your app.");
      return;
    }
    setError("");
    setIsLoading(true);

    const { ui, result } = await run(specification);

    setUi(ui);
    result.then(setCode);

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI App Creator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="app-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Describe your app
          </label>
          <Textarea
            id="specification"
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            placeholder={defaultSpecification}
            className="w-full h-32"
            disabled={isLoading}
          />
        </div>
        {ui}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating App...
            </>
          ) : (
            <>
              <Code2 className="mr-2 h-4 w-4" />
              Create App
            </>
          )}
        </Button>
      </form>
      {code && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Python Code:</h2>
          <Textarea
            value={code}
            readOnly
            className="w-full h-64 font-mono text-sm bg-gray-100"
          />
        </div>
      )}
    </div>
  );
}
