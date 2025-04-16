import Banner from "@/components/Home/banner";
import Categories from "@/components/Home/Categories";
import Discount from "@/components/Home/Discount";
import EidCountdownTimer from "@/components/Home/EidCountdownTimer";
import Feature from "@/components/Home/feature";
import { JustForYou } from "@/components/Home/just";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
	return (
		<main className=" min-h-screen pb-8">
			<div className="container mx-auto px-4">
				<Banner></Banner>

        <Categories></Categories>
        <JustForYou></JustForYou>
        <Feature></Feature>
        <Discount></Discount>
		<EidCountdownTimer />

			</div>
		</main>
	);
}
