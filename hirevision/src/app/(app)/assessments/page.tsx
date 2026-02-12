'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, ArrowRight, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Question = {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
};

type Quiz = {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    skill: string;
};

const SAMPLE_QUIZ: Quiz = {
    id: 'react-basics',
    title: 'React Fundamentals',
    description: 'Test your knowledge of Components, Hooks, and State.',
    skill: 'React',
    questions: [
        {
            id: 1,
            text: "What is the correct hook to handle side effects in a functional component?",
            options: ["useEffect", "useState", "useSideEffect", "componentDidMount"],
            correctAnswer: 0
        },
        {
            id: 2,
            text: "How do you pass data from a parent to a child component?",
            options: ["State", "Props", "Context", "Refs"],
            correctAnswer: 1
        },
        {
            id: 3,
            text: "Which method is used to update state in a class component?",
            options: ["updateState()", "changeState()", "setState()", "modifyState()"],
            correctAnswer: 2
        }
    ]
};

export default function SkillAssessmentPage() {
    const { toast } = useToast();
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);

    const handleStart = () => {
        setStarted(true);
        setFinished(false);
        setCurrentQ(0);
        setAnswers({});
        setScore(0);
    };

    const handleAnswer = (val: string) => {
        setAnswers({ ...answers, [currentQ]: parseInt(val) });
    };

    const handleNext = () => {
        if (currentQ < SAMPLE_QUIZ.questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            calculateScore();
        }
    };

    const calculateScore = () => {
        let correct = 0;
        SAMPLE_QUIZ.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        const finalScore = Math.round((correct / SAMPLE_QUIZ.questions.length) * 100);
        setScore(finalScore);
        setFinished(true);

        if (finalScore >= 70) {
            toast({
                title: "Congratulations! 🎉",
                description: `You passed with ${finalScore}%. Badge earned!`,
            });
        }
    };

    if (finished) {
        return (
            <div className="container max-w-2xl py-20 text-center space-y-8">
                <Card className="border-2 border-primary/20 shadow-2xl">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                            <Trophy className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Assessment Complete</CardTitle>
                        <CardDescription>Here is how you performed on {SAMPLE_QUIZ.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            {score}%
                        </div>
                        <p className="text-muted-foreground">
                            {score >= 70 ? "Great job! You have demonstrated strong proficiency." : "Keep practicing! You need 70% to earn the badge."}
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleStart}>Retry Quiz</Button>
                            <Button asChild>
                                <a href="/courses">Explore Courses</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (started) {
        const question = SAMPLE_QUIZ.questions[currentQ];
        const progress = ((currentQ + 1) / SAMPLE_QUIZ.questions.length) * 100;

        return (
            <div className="container max-w-2xl py-20 space-y-8">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Question {currentQ + 1} of {SAMPLE_QUIZ.questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">{question.text}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup onValueChange={handleAnswer} value={answers[currentQ]?.toString()}>
                            {question.options.map((opt, i) => (
                                <div key={i} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleNext} disabled={answers[currentQ] === undefined}>
                                {currentQ === SAMPLE_QUIZ.questions.length - 1 ? 'Finish' : 'Next Question'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-12 space-y-8">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Skill Assessments</h1>
                    <p className="text-muted-foreground">Verify your skills and earn badges to stand out to recruiters.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">React</Badge>
                            <Trophy className="w-4 h-4 text-yellow-500" />
                        </div>
                        <CardTitle>React Fundamentals</CardTitle>
                        <CardDescription>Components, Hooks, State Management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 15 Qs</span>
                            <span>•</span>
                            <span>15 Mins</span>
                        </div>
                        <Button className="w-full" onClick={handleStart}>Start Assessment</Button>
                    </CardContent>
                </Card>

                 {/* Placeholders for other quizzes */}
                 {[1, 2].map((i) => (
                    <Card key={i} className="opacity-60">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline">Coming Soon</Badge>
                            </div>
                            <CardTitle>Advanced TypeScript</CardTitle>
                            <CardDescription>Generics, Utility Types, Inference</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" disabled variant="secondary">Locked</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}


