'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChallengeEditorProps {
    challengeId: string;
    initialCode?: string;
    language?: string;
    onRun?: (code: string, language: string) => Promise<any>;
}

export function ChallengeEditor({ challengeId, initialCode = '// Write your solution here...', language = 'javascript', onRun }: ChallengeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [lang, setLang] = useState(language);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<any>(null);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            // If parent provides a runner, use it. Otherwise simulate.
            if (onRun) {
                const result = await onRun(code, lang);
                setOutput(result);
            } else {
                // Simulation
                await new Promise(r => setTimeout(r, 1500));
                setOutput({
                    success: true,
                    logs: ['Test Case 1: Passed', 'Test Case 2: Passed', 'Performance: 12ms'],
                    score: 100
                });
            }
        } catch (e: any) {
            setOutput({
                success: false,
                error: e.message || 'Runtime Error'
            });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between p-2 border-b bg-muted/50">
                        <Select value={lang} onValueChange={setLang}>
                            <SelectTrigger className="w-[180px] h-8">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-green-600 hover:bg-green-700 text-white">
                            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Run Code
                        </Button>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={lang}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </Card>
            </div>
            
            <div className="flex flex-col gap-4">
                <Card className="h-full flex flex-col">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-sm font-medium">Output / Console</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 bg-black text-green-400 font-mono text-xs overflow-auto">
                        {output ? (
                            <div className="space-y-2">
                                {output.success ? (
                                    <>
                                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm mb-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Build Succeeded
                                        </div>
                                        {output.logs?.map((log: string, i: number) => (
                                            <div key={i}>&gt; {log}</div>
                                        ))}
                                        {output.score && (
                                            <div className="mt-4 pt-4 border-t border-green-900">
                                                <span className="text-white">Score: </span>
                                                <Badge className="bg-green-600">{output.score}/100</Badge>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2">
                                            <XCircle className="w-4 h-4" />
                                            Build Failed
                                        </div>
                                        <div className="text-red-400">{output.error}</div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-slate-500 italic">
                                Ready to execute. Click 'Run Code' to see output.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
