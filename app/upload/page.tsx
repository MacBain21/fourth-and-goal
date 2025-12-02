"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from "tesseract.js";

interface ParsedData {
  scoringFormat?: string;
  leagueSize?: number;
  roster: Array<{
    name: string;
    position: string;
    team?: string;
    projectedPoints?: number;
  }>;
  availablePlayers: Array<{
    name: string;
    position: string;
    team?: string;
    projectedPoints?: number;
  }>;
  rawText: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let allText = "";

      // Process each image with Tesseract.js
      for (let i = 0; i < files.length; i++) {
        const worker = await createWorker("eng", undefined, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const fileProgress = ((i + m.progress) / files.length) * 100;
              setProgress(Math.round(fileProgress));
            }
          },
        });

        const { data } = await worker.recognize(files[i]);

        allText += data.text + "\n\n---\n\n";
        await worker.terminate();
      }

      // Parse the OCR text into structured data
      const parsed = parseESPNData(allText);
      setParsedData(parsed);

      // Store in localStorage for the analysis page
      localStorage.setItem("leagueData", JSON.stringify(parsed));
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Error processing images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // TODO: Improve this parsing logic based on actual ESPN screenshot format
  const parseESPNData = (text: string): ParsedData => {
    const lines = text.split("\n").filter((line) => line.trim());

    // Detect scoring format (best-effort)
    let scoringFormat = "Standard";
    if (text.toLowerCase().includes("ppr")) {
      if (text.toLowerCase().includes("half")) {
        scoringFormat = "Half PPR";
      } else {
        scoringFormat = "PPR";
      }
    }

    // Detect league size (best-effort)
    const leagueSizeMatch = text.match(/(\d+)\s*team/i);
    const leagueSize = leagueSizeMatch ? parseInt(leagueSizeMatch[1]) : undefined;

    // Parse roster and available players (placeholder logic)
    // TODO: Improve based on actual ESPN format
    const roster: ParsedData["roster"] = [];
    const availablePlayers: ParsedData["availablePlayers"] = [];

    // Simple pattern matching for player names (this is a placeholder)
    const playerPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(QB|RB|WR|TE|K|DEF)\s+([A-Z]{2,4})?/g;
    let match;

    while ((match = playerPattern.exec(text)) !== null) {
      const player = {
        name: match[1],
        position: match[2],
        team: match[3],
      };

      // Simple heuristic: first players are roster, rest are available
      if (roster.length < 15) {
        roster.push(player);
      } else {
        availablePlayers.push(player);
      }
    }

    return {
      scoringFormat,
      leagueSize,
      roster,
      availablePlayers,
      rawText: text,
    };
  };

  const handleConfirm = () => {
    if (parsedData) {
      router.push("/analysis");
    }
  };

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upload League Screenshots
            </h1>
            <p className="text-lg text-gray-600">
              Upload screenshots from ESPN showing your league settings, roster, and
              available players.
            </p>
          </div>

          {/* Upload Area */}
          {!parsedData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                isDragging
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />

              <div className="pointer-events-none">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your screenshots here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB each</p>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && !parsedData && (
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                      disabled={isProcessing}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {!isProcessing && (
                <button
                  onClick={processImages}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Process Images
                </button>
              )}
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Screenshots...
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Extracting text from images
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {/* Parsed Data Review */}
          {parsedData && !isProcessing && (
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Review Your Data
              </h3>

              <div className="space-y-6">
                {/* League Settings */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    League Settings
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Scoring Format:</span>{" "}
                      {parsedData.scoringFormat || "Unknown"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">League Size:</span>{" "}
                      {parsedData.leagueSize
                        ? `${parsedData.leagueSize} teams`
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Roster */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Your Roster ({parsedData.roster.length} players)
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                    {parsedData.roster.length > 0 ? (
                      <div className="space-y-2">
                        {parsedData.roster.map((player, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{player.name}</span> -{" "}
                            {player.position}
                            {player.team && ` (${player.team})`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No players detected</p>
                    )}
                  </div>
                </div>

                {/* Available Players */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Players ({parsedData.availablePlayers.length} players)
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                    {parsedData.availablePlayers.length > 0 ? (
                      <div className="space-y-2">
                        {parsedData.availablePlayers.slice(0, 10).map((player, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{player.name}</span> -{" "}
                            {player.position}
                            {player.team && ` (${player.team})`}
                          </div>
                        ))}
                        {parsedData.availablePlayers.length > 10 && (
                          <p className="text-sm text-gray-500 italic">
                            ...and {parsedData.availablePlayers.length - 10} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No players detected</p>
                    )}
                  </div>
                </div>

                {/* Raw JSON Preview */}
                <details className="bg-gray-50 rounded-xl p-4">
                  <summary className="font-medium text-gray-900 cursor-pointer">
                    View Raw JSON
                  </summary>
                  <pre className="mt-4 text-xs bg-white p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFiles([]);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-colors duration-200"
                >
                  Start Over
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Continue to Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
