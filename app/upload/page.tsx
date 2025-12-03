"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [processingStep, setProcessingStep] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoFile = (file: File) => {
    return file.type.startsWith("video/");
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

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

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => isImageFile(file) || isVideoFile(file)
    );

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
      }
    },
    []
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Extract frames from video
  const extractFramesFromVideo = async (
    videoFile: File
  ): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const frames: string[] = [];

      video.preload = "metadata";
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;

        // Extract frames every 0.5 seconds
        const frameInterval = 0.5;
        const totalFrames = Math.floor(duration / frameInterval);
        let currentFrame = 0;

        const captureFrame = () => {
          if (currentFrame >= totalFrames) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }

          video.currentTime = currentFrame * frameInterval;
        };

        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL("image/jpeg", 0.8));
            currentFrame++;
            setProgress(Math.round((currentFrame / totalFrames) * 50)); // First 50% for extraction
            captureFrame();
          }
        };

        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          reject(new Error("Error loading video"));
        };

        captureFrame();
      };
    });
  };

  const processImages = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep("Preparing files...");

    try {
      let allText = "";
      let processedFrames = 0;
      let totalFramesToProcess = 0;

      // First, prepare all frames (extract from videos)
      const framesToProcess: string[] = [];

      for (const file of files) {
        if (isVideoFile(file)) {
          setProcessingStep(`Extracting frames from ${file.name}...`);
          const frames = await extractFramesFromVideo(file);
          framesToProcess.push(...frames);
        } else if (isImageFile(file)) {
          // Convert image file to data URL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          framesToProcess.push(dataUrl);
        }
      }

      totalFramesToProcess = framesToProcess.length;
      setProcessingStep(`Processing ${totalFramesToProcess} frames with OCR...`);

      // Process each frame with Tesseract.js
      for (let i = 0; i < framesToProcess.length; i++) {
        const worker = await createWorker("eng", undefined, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const overallProgress =
                50 + ((processedFrames + m.progress) / totalFramesToProcess) * 50;
              setProgress(Math.round(overallProgress));
            }
          },
        });

        const { data } = await worker.recognize(framesToProcess[i]);
        allText += data.text + "\n\n---FRAME---\n\n";
        await worker.terminate();

        processedFrames++;
        setProgress(Math.round(50 + (processedFrames / totalFramesToProcess) * 50));
      }

      setProcessingStep("Analyzing data...");

      // Parse the OCR text into structured data
      const parsed = parseESPNData(allText);
      setParsedData(parsed);

      // Store in localStorage for the analysis page
      localStorage.setItem("leagueData", JSON.stringify(parsed));

      setProcessingStep("Complete!");
    } catch (error) {
      console.error("Error processing files:", error);
      alert("Error processing files. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // TODO: Improve this parsing logic based on actual ESPN format
  const parseESPNData = (text: string): ParsedData => {
    const lines = text.split("\n").filter((line) => line.trim());

    // Detect scoring format
    let scoringFormat = "Standard";
    if (text.toLowerCase().includes("ppr")) {
      if (text.toLowerCase().includes("half")) {
        scoringFormat = "Half PPR";
      } else {
        scoringFormat = "PPR";
      }
    }

    // Detect league size
    const leagueSizeMatch = text.match(/(\d+)\s*team/i);
    const leagueSize = leagueSizeMatch
      ? parseInt(leagueSizeMatch[1])
      : undefined;

    // Parse roster and available players
    const roster: ParsedData["roster"] = [];
    const availablePlayers: ParsedData["availablePlayers"] = [];

    // Enhanced pattern matching for player names with projections
    const playerPattern =
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(QB|RB|WR|TE|K|DEF|DST)\s+([A-Z]{2,4})?(?:\s+(\d+\.?\d*))?/g;
    let match;

    while ((match = playerPattern.exec(text)) !== null) {
      const player = {
        name: match[1].trim(),
        position: match[2],
        team: match[3],
        projectedPoints: match[4] ? parseFloat(match[4]) : undefined,
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

  const fileIcons: Record<string, string> = {
    video: "🎥",
    image: "📸",
  };

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-[#000918] via-[#051639] to-[#020712]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#26D36B]/20 backdrop-blur-sm border border-[#26D36B]/30 rounded-full mb-6">
              <span className="text-2xl">📱</span>
              <span className="text-sm font-semibold text-[#26D36B]">
                iPhone Screen Recordings Supported
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Upload Your League Data
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
              Record your ESPN app walkthrough or upload screenshots. We&apos;ll extract
              everything automatically.
            </p>
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A8CFF]/20 hover:bg-[#1A8CFF]/30 border border-[#1A8CFF]/40 hover:border-[#1A8CFF]/60 rounded-full text-white font-semibold transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Use ESPN Connect Instead (Recommended)
            </Link>
          </div>

          {/* Upload Area */}
          {!parsedData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? "border-[#26D36B] bg-[#26D36B]/10 scale-105 shadow-2xl shadow-[#26D36B]/30"
                  : "border-white/20 bg-white rounded-3xl hover:border-[#1A8CFF]/50 hover:shadow-2xl"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />

              <div className="pointer-events-none">
                <div className="text-7xl mb-6">🎬</div>
                <p className="text-2xl font-bold text-[#0B1E3D] mb-3">
                  Drop your files here
                </p>
                <p className="text-lg text-gray-600 mb-2">or click to browse</p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A8CFF]/10 to-[#1A8CFF]/20 border border-[#1A8CFF]/30 rounded-xl">
                    <span className="text-2xl">🎥</span>
                    <span className="text-sm font-medium text-[#1A8CFF]">
                      Videos (.mov, .mp4)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-500/20 border border-purple-500/30 rounded-xl">
                    <span className="text-2xl">📸</span>
                    <span className="text-sm font-medium text-purple-600">
                      Images (.png, .jpg)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && !parsedData && (
            <div className="mt-8 bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-[#0B1E3D] mb-6">
                Uploaded Files ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">
                        {isVideoFile(file) ? fileIcons.video : fileIcons.image}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-gray-900 truncate block max-w-md">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
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
                  className="mt-8 w-full bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-300"
                >
                  Process Files →
                </button>
              )}
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-8 bg-white rounded-3xl p-10 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#26D36B] to-[#1A8CFF] rounded-3xl mb-6 animate-pulse">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1E3D] mb-3">
                  {processingStep}
                </h3>
                <p className="text-gray-600 mb-6">
                  This may take a minute for videos...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-[#0B1E3D]">
                  {progress}% complete
                </p>
              </div>
            </div>
          )}

          {/* Parsed Data Review */}
          {parsedData && !isProcessing && (
            <div className="mt-8 bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">✅</span>
                <h3 className="text-3xl font-bold text-gray-900">
                  Data Extracted Successfully!
                </h3>
              </div>

              <div className="space-y-6">
                {/* League Settings */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    League Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Scoring Format
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {parsedData.scoringFormat || "Unknown"}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">League Size</p>
                      <p className="text-xl font-bold text-gray-900">
                        {parsedData.leagueSize
                          ? `${parsedData.leagueSize} teams`
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Roster */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Your Roster ({parsedData.roster.length} players)
                  </h4>
                  <div className="bg-white rounded-xl p-4 max-h-64 overflow-y-auto">
                    {parsedData.roster.length > 0 ? (
                      <div className="space-y-2">
                        {parsedData.roster.map((player, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-semibold">{player.name}</span>
                            <span className="text-gray-600">
                              {player.position}
                              {player.team && ` • ${player.team}`}
                              {player.projectedPoints &&
                                ` • ${player.projectedPoints} pts`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No players detected</p>
                    )}
                  </div>
                </div>

                {/* Available Players */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Available Players ({parsedData.availablePlayers.length}{" "}
                    players)
                  </h4>
                  <div className="bg-white rounded-xl p-4 max-h-64 overflow-y-auto">
                    {parsedData.availablePlayers.length > 0 ? (
                      <div className="space-y-2">
                        {parsedData.availablePlayers
                          .slice(0, 10)
                          .map((player, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                            >
                              <span className="font-semibold">
                                {player.name}
                              </span>
                              <span className="text-gray-600">
                                {player.position}
                                {player.team && ` • ${player.team}`}
                              </span>
                            </div>
                          ))}
                        {parsedData.availablePlayers.length > 10 && (
                          <p className="text-sm text-gray-500 italic text-center pt-2">
                            ...and {parsedData.availablePlayers.length - 10} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No players detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFiles([]);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-bold hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
                >
                  ← Start Over
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] text-[#0B1E3D] py-4 px-6 rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#26D36B]/30 transform hover:scale-105 transition-all duration-300"
                >
                  Continue to Analysis →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
