"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PartyPopper } from "lucide-react";

export default function EidCountdownTimer() {
	const eidDate = new Date("April 20, 2025 00:00:00").getTime();
	const startDate = new Date("March 11, 2025 00:00:00").getTime();
	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const [progress, setProgress] = useState(0);
	const [showConfetti, setShowConfetti] = useState(false);

	// Calculate time remaining and progress
	useEffect(() => {
		const timer = setInterval(() => {
			const now = new Date().getTime();
			const difference = eidDate - now;
			const totalDuration = eidDate - startDate;
			const elapsed = now - startDate;
			const progressPercent = Math.min(
				Math.max((elapsed / totalDuration) * 100, 0),
				100
			);

			if (difference > 0) {
				setTimeLeft({
					days: Math.floor(difference / (1000 * 60 * 60 * 24)),
					hours: Math.floor(
						(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
					),
					minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
					seconds: Math.floor((difference % (1000 * 60)) / 1000),
				});
				setProgress(progressPercent);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [eidDate, startDate]);

	// Lantern animation positions
	const lanternPositions = [
		{ top: "10%", left: "5%", delay: "0s", size: "w-6 h-8" },
		{ top: "23%", right: "12%", delay: "0.3s", size: "w-4 h-6" },
		{ top: "25%", left: "12%", delay: "0.5s", size: "w-4 h-6" },
		{ top: "30%", right: "20%", delay: "0.7s", size: "w-4 h-6" },
		{ top: "30%", left: "20%", delay: "0.9s", size: "w-4 h-6" },
		{ top: "10%", right: "5%", delay: "1.1s", size: "w-6 h-8" },
	];

	// Trigger confetti effect
	const triggerConfetti = () => {
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 3000);
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			<div className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl p-6">
				{/* Background pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[size:20px_20px]"></div>
				</div>

				{/* Animated lanterns */}
				{lanternPositions.map((pos, i) => (
					<div
						key={i}
						className={`absolute ${pos.size} animate-pulse`}
						style={{
							top: pos.top,
							left: pos.left,
							right: pos.right,
							animationDelay: pos.delay,
							animationDuration: "2s",
						}}
					>
						<div className="w-full h-full bg-amber-400 rounded-b-full relative">
							<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-amber-700"></div>
							<div className="absolute inset-x-1 top-1 bottom-2 bg-amber-300 rounded-b-full"></div>
						</div>
					</div>
				))}

				{/* Content */}
				<div className="relative z-10">
					{/* Header */}
					<div className="text-center mb-6">
						<h1 className="text-3xl font-bold text-white mb-2">
							<span className="inline-block animate-bounce mr-2">✨</span>
							Eid Countdown
							<span className="inline-block animate-bounce ml-2">✨</span>
						</h1>
						<p className="text-purple-200 text-sm">
							The celebration approaches...
						</p>
					</div>

					<div className="space-y-6">
						{/* Progress bar */}
						<div className="space-y-2">
							<div className="flex justify-between text-xs text-purple-200">
								<span>Journey to Eid</span>
								<span>{Math.round(progress)}% complete</span>
							</div>
							<Progress value={progress} className="h-2 bg-purple-800/50" />
						</div>

						{/* Timer digits */}
						<div className="grid grid-cols-4 gap-2 md:gap-4">
							{[
								{ label: "DAYS", value: timeLeft.days },
								{ label: "HOURS", value: timeLeft.hours },
								{ label: "MINUTES", value: timeLeft.minutes },
								{ label: "SECONDS", value: timeLeft.seconds },
							].map((unit, i) => (
								<div key={i} className="relative group">
									<div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
									<div className="relative bg-black/50 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center">
										<span className="text-white text-2xl md:text-3xl font-bold font-mono">
											{String(unit.value).padStart(2, "0")}
										</span>
										<span className="text-purple-200 text-xs">
											{unit.label}
										</span>
									</div>
								</div>
							))}
						</div>

						{/* Celebration button */}
						<div className="flex justify-center">
							<Button
								className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg border-none"
								onClick={triggerConfetti}
							>
								<PartyPopper className="mr-2 h-4 w-4" />
								Celebrate Early!
							</Button>
						</div>
					</div>
					{/* Confetti effect */}
					{showConfetti && (
						<div className="absolute inset-0 overflow-hidden">
							{Array.from({ length: 50 }).map((_, i) => {
								const size = Math.random() * 10 + 5;
								const left = Math.random() * 100;
								const animationDuration = Math.random() * 3 + 2;
								const color = [
									"bg-amber-400",
									"bg-purple-400",
									"bg-emerald-400",
									"bg-pink-400",
									"bg-orange-400",
								][Math.floor(Math.random() * 5)];
								return (
									<div
										key={i}
										className={`absolute ${color} rounded-md`}
										style={{
											width: size + "px",
											height: size + "px",
											left: left + "%",
											top: "-5%",
											animation: `fall ${animationDuration}s linear forwards`,
											animationDelay: Math.random() * 3 + "s",
										}}
									/>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* CSS for confetti animation */}
			<style jsx>
				{`
					@keyframes fall {
						0% {
							transform: translateY(0) rotate(0deg);
							opacity: 1;
						}
						100% {
							transform: translateY(100vh) rotate(720deg);
							opacity: 0;
						}
					}
				`}
			</style>
		</div>
	);
}
